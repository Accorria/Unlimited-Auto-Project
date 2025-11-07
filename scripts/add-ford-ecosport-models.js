/**
 * Script to add all Ford EcoSport models and trims to the database
 * EcoSport was available in the US from 2018-2022
 * Trims: S, SE, SES, Titanium
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Try to load environment variables from .env.local
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
} catch (error) {
  console.warn('Could not load .env.local file, using environment variables directly');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

// Ford EcoSport configurations
const years = [2018, 2019, 2020, 2021, 2022];
const trims = [
  { name: 'S', code: 'ES-S', engine: '1.0L EcoBoost I3', drivetrain: 'Front-Wheel Drive' },
  { name: 'SE', code: 'ES-SE', engine: '1.0L EcoBoost I3', drivetrain: 'Front-Wheel Drive' },
  { name: 'SES', code: 'ES-SES', engine: '2.0L Ti-VCT I4', drivetrain: 'Intelligent 4WD' },
  { name: 'Titanium', code: 'ES-TI', engine: '1.0L EcoBoost I3', drivetrain: 'Front-Wheel Drive' }
];

async function addFordEcoSportModels() {
  try {
    console.log('Starting to add Ford EcoSport models and trims...\n');

    // Get the dealer ID
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('id')
      .eq('slug', 'unlimited-auto')
      .single();

    if (dealerError || !dealer) {
      console.error('Error fetching dealer:', dealerError);
      throw new Error('Dealer not found');
    }

    console.log(`Found dealer: ${dealer.id}\n`);

    const vehiclesToInsert = [];

    // Generate all year/trim combinations
    for (const year of years) {
      for (const trim of trims) {
        vehiclesToInsert.push({
          dealer_id: dealer.id,
          year: year,
          make: 'Ford',
          model: 'EcoSport',
          model_code: trim.code,
          trim: trim.name,
          status: 'available',
          description: 'Great value, perfect for families, financing available',
          body_style: 'SUV',
          engine: trim.engine,
          transmission: '6-Speed Automatic',
          drivetrain: trim.drivetrain,
          fuel_type: 'Gas',
          doors: 4,
          passengers: 5
        });
      }
    }

    console.log(`Prepared ${vehiclesToInsert.length} vehicles to insert\n`);

    // Insert vehicles in batches to avoid overwhelming the database
    const batchSize = 10;
    let inserted = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < vehiclesToInsert.length; i += batchSize) {
      const batch = vehiclesToInsert.slice(i, i + batchSize);
      
      for (const vehicle of batch) {
        const { data, error } = await supabase
          .from('vehicles')
          .insert(vehicle)
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            // Unique constraint violation - vehicle already exists
            skipped++;
            console.log(`⏭️  Skipped: ${vehicle.year} Ford EcoSport ${vehicle.trim} (already exists)`);
          } else {
            errors++;
            console.error(`❌ Error inserting ${vehicle.year} Ford EcoSport ${vehicle.trim}:`, error.message);
          }
        } else {
          inserted++;
          console.log(`✅ Added: ${vehicle.year} Ford EcoSport ${vehicle.trim}`);
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('Summary:');
    console.log(`✅ Successfully inserted: ${inserted}`);
    console.log(`⏭️  Skipped (already exists): ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📊 Total processed: ${vehiclesToInsert.length}`);
    console.log('='.repeat(50));

    // Verify the insertions
    console.log('\nVerifying insertions...\n');
    const { data: vehicles, error: verifyError } = await supabase
      .from('vehicles')
      .select('year, make, model, trim')
      .eq('make', 'Ford')
      .eq('model', 'EcoSport')
      .order('year', { ascending: false })
      .order('trim', { ascending: true });

    if (verifyError) {
      console.error('Error verifying vehicles:', verifyError);
    } else {
      console.log(`Found ${vehicles.length} Ford EcoSport vehicles in database:\n`);
      
      // Group by year
      const byYear = {};
      vehicles.forEach(v => {
        if (!byYear[v.year]) byYear[v.year] = [];
        byYear[v.year].push(v.trim);
      });

      Object.keys(byYear).sort((a, b) => b - a).forEach(year => {
        console.log(`  ${year}: ${byYear[year].join(', ')}`);
      });
    }

    console.log('\n✅ Script completed successfully!');

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
addFordEcoSportModels();

