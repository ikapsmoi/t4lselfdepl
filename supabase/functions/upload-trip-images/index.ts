import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase client with anon key for JWT validation
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Validate JWT and get user
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase client with service role for storage operations
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse form data
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const tripId = formData.get('tripId') as string;

    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No files provided' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (files.length > 10) {
      return new Response(
        JSON.stringify({ error: 'Maximum 5 images allowed' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const uploadedUrls: string[] = [];

    // Ensure the bucket exists, create if it doesn't
    const { data: buckets, error: listError } = await supabaseService.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'trip-images');
    
    if (!bucketExists) {
      const { error: createBucketError } = await supabaseService.storage.createBucket('trip-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (createBucketError) {
        console.error('Error creating bucket:', createBucketError);
        return new Response(
          JSON.stringify({ error: 'Failed to create storage bucket' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Upload each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        return new Response(
          JSON.stringify({ error: `File ${i + 1} is not a valid image` }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Validate file size (max 10MB per image)
      if (file.size > 10 * 1024 * 1024) {
        return new Response(
          JSON.stringify({ error: `File ${i + 1} size must be less than 10MB` }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = tripId 
        ? `${tripId}/${user.id}-${Date.now()}-${i}.${fileExt}`
        : `temp/${user.id}-${Date.now()}-${i}.${fileExt}`;

      // Convert File to ArrayBuffer for upload
      const fileBuffer = await file.arrayBuffer();

      // Upload to Supabase Storage using service role
      const { data: uploadData, error: uploadError } = await supabaseService.storage
        .from('trip-images')
        .upload(fileName, fileBuffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return new Response(
          JSON.stringify({ error: `Upload failed for file ${i + 1}: ${uploadError.message}` }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Get public URL
      const { data: { publicUrl } } = supabaseService.storage
        .from('trip-images')
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
    }

    return new Response(
      JSON.stringify({ 
        message: 'Images uploaded successfully',
        image_urls: uploadedUrls 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Upload trip images error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});