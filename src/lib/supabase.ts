import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
  throw new Error(
    '[NGO Command Center] NEXT_PUBLIC_SUPABASE_URL is not configured. ' +
    'Add it to your .env.local file and to your Vercel project environment variables.'
  )
}

if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  throw new Error(
    '[NGO Command Center] NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured. ' +
    'Add it to your .env.local file and to your Vercel project environment variables.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: { eventsPerSecond: 10 },
  },
})
