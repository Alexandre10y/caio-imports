import { createClient } from '@supabase/supabase-js'

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  return { url, key }
}

function isAuthorized(req) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return process.env.NODE_ENV !== 'production'
  return req.headers.authorization === `Bearer ${cronSecret}`
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' })
  }

  const { url, key } = getSupabaseConfig()
  if (!url || !key) {
    return res.status(503).json({ ok: false, error: 'Supabase not configured' })
  }

  const supabase = createClient(url, key)
  const { data, error } = await supabase.from('site_content').select('key').limit(1)

  if (error) {
    return res.status(502).json({ ok: false, error: error.message })
  }

  return res.status(200).json({
    ok: true,
    rows: data?.length ?? 0,
    at: new Date().toISOString(),
  })
}
