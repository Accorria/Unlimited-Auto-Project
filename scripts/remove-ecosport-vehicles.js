/**
 * Script to remove all Ford EcoSport vehicles from the database
 * These were added by mistake - user only wanted EcoSport in the dropdown
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
  console.error('❌ Error: Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function removeEcoSportVehicles() {
  console.log('🗑️  Removing all Ford EcoSport vehicles from database...\n');

  try {
    // First, find all EcoSport vehicles
    const { data: vehicles, error: fetchError } = await supabase
      .from('vehicles')
      .select('id, year, make, model, trim')
      .eq('make', 'Ford')
      .eq('model', 'EcoSport');

    if (fetchError) {
      console.error('❌ Error fetching vehicles:', fetchError);
      throw fetchError;
    }

    if (!vehicles || vehicles.length === 0) {
      console.log('✅ No EcoSport vehicles found in database');
      return;
    }

    console.log(`Found ${vehicles.length} EcoSport vehicles to remove:\n`);
    vehicles.forEach(v => {
      console.log(`  - ${v.year} Ford EcoSport ${v.trim || ''}`);
    });
    console.log('');

    // Get vehicle IDs
    const vehicleIds = vehicles.map(v => v.id);

    // Delete associated photos first (if any)
    console.log('1. Removing associated photos...');
    const { error: photosError } = await supabase
      .from('vehicle_photos')
      .delete()
      .in('vehicle_id', vehicleIds);

    if (photosError) {
      console.warn('⚠️  Warning: Error removing photos:', photosError.message);
    } else {
      console.log('✅ Photos removed');
    }

    // Delete the vehicles
    console.log('\n2. Removing vehicles...');
    const { error: deleteError } = await supabase
      .from('vehicles')
      .delete()
      .in('id', vehicleIds);

    if (deleteError) {
      console.error('❌ Error removing vehicles:', deleteError);
      throw deleteError;
    }

    console.log(`✅ Successfully removed ${vehicles.length} EcoSport vehicles from database\n`);

    // Verify deletion
    const { data: remaining, error: verifyError } = await supabase
      .from('vehicles')
      .select('id')
      .eq('make', 'Ford')
      .eq('model', 'EcoSport');

    if (verifyError) {
      console.warn('⚠️  Could not verify deletion:', verifyError);
    } else if (remaining && remaining.length > 0) {
      console.warn(`⚠️  Warning: ${remaining.length} EcoSport vehicles still remain`);
    } else {
      console.log('✅ Verification: All EcoSport vehicles have been removed');
    }

    console.log('\n✅ Done! EcoSport is still available in the dropdown menu for adding new vehicles.');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the script
removeEcoSportVehicles();

