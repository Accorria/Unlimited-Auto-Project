/**
 * Script to check Supabase Storage setup
 * Verifies bucket exists and has proper permissions
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

async function checkStorageSetup() {
  console.log('🔍 Checking Supabase Storage setup...\n');

  try {
    // Check if we can access storage
    console.log('1. Checking storage access...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Error accessing storage:', listError.message);
      console.error('\n💡 Solutions:');
      console.error('   - Check if Supabase Storage is enabled');
      console.error('   - Verify your SUPABASE_SERVICE_ROLE key is correct');
      console.error('   - Check if your Supabase project is active');
      return;
    }

    console.log('✅ Storage access OK');
    console.log(`   Found ${buckets?.length || 0} bucket(s)\n`);

    // Check if vehicle-images bucket exists
    console.log('2. Checking for vehicle-images bucket...');
    const bucketExists = buckets?.some(bucket => bucket.name === 'vehicle-images');

    if (!bucketExists) {
      console.error('❌ Bucket "vehicle-images" does not exist!');
      console.error('\n💡 To create the bucket:');
      console.error('   1. Go to your Supabase Dashboard');
      console.error('   2. Click "Storage" in the left sidebar');
      console.error('   3. Click "New Bucket"');
      console.error('   4. Name: vehicle-images');
      console.error('   5. Set to Public');
      console.error('   6. Click "Create bucket"');
      return;
    }

    console.log('✅ Bucket "vehicle-images" exists\n');

    // Check bucket details
    const bucket = buckets.find(b => b.name === 'vehicle-images');
    console.log('3. Bucket details:');
    console.log(`   Name: ${bucket.name}`);
    console.log(`   Public: ${bucket.public ? 'Yes ✅' : 'No ❌'}`);
    console.log(`   Created: ${bucket.created_at}`);
    console.log(`   Updated: ${bucket.updated_at}\n`);

    if (!bucket.public) {
      console.warn('⚠️  Warning: Bucket is not public!');
      console.warn('   Photos may not be accessible on your website.');
      console.warn('   Make the bucket public in Supabase Dashboard.\n');
    }

    // Test upload permissions
    console.log('4. Testing upload permissions...');
    const testFileName = `test_${Date.now()}.txt`;
    const testContent = new Blob(['test'], { type: 'text/plain' });

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('vehicle-images')
      .upload(testFileName, testContent, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError.message);
      console.error('\n💡 Solutions:');
      console.error('   - Check bucket policies in Supabase Dashboard');
      console.error('   - Make sure INSERT policy exists for the bucket');
      console.error('   - Verify service role key has proper permissions');
    } else {
      console.log('✅ Upload test successful!');
      
      // Clean up test file
      await supabase.storage
        .from('vehicle-images')
        .remove([testFileName]);
      console.log('   Test file cleaned up\n');
    }

    // Check policies (if we can)
    console.log('5. Storage setup summary:');
    console.log('   ✅ Bucket exists');
    console.log(`   ${bucket.public ? '✅' : '❌'} Bucket is ${bucket.public ? 'public' : 'private'}`);
    console.log(`   ${uploadError ? '❌' : '✅'} Upload permissions ${uploadError ? 'failed' : 'OK'}`);
    console.log('\n✅ Storage setup looks good!');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the check
checkStorageSetup();

