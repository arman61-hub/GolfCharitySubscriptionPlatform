const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function setupStorage() {
  console.log('Checking storage buckets...');
  
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('Error listing buckets:', listError);
    return;
  }

  const bucketName = 'proofs';
  const exists = buckets.find(b => b.name === bucketName);

  if (!exists) {
    console.log(`Creating bucket: ${bucketName}`);
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'application/pdf'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (createError) {
      console.error('Error creating bucket:', createError);
    } else {
      console.log(`Bucket ${bucketName} created successfully.`);
    }
  } else {
    console.log(`Bucket ${bucketName} already exists.`);
  }
}

setupStorage();
