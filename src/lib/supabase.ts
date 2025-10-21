import { createClient } from '@supabase/supabase-js';

// Check if we're in a build environment (no env vars available)
const isBuildTime = typeof window === 'undefined' && !process.env.NEXT_PUBLIC_SUPABASE_URL;

// Create a dummy client for build time
const dummyClient = {
  auth: { 
    signInWithOtp: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ 
      data: { subscription: { unsubscribe: () => {} } } 
    })
  },
  from: () => ({ 
    select: () => ({ 
      single: () => Promise.resolve({ data: null, error: null }) 
    }) 
  }),
  storage: { 
    from: () => ({ 
      upload: () => Promise.resolve({ data: null, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
      remove: () => Promise.resolve({ data: null, error: null })
    }) 
  }
};

export const supabase = isBuildTime 
  ? dummyClient as any
  : createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // browser-safe for reads
      { auth: { persistSession: false } }
    );

// Server-side service role client (DO NOT expose to browser)
export function supabaseServer() {
  if (isBuildTime) {
    return dummyClient as any;
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!, // server only
    { auth: { persistSession: false } }
  );
}
