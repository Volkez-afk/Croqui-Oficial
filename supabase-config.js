import { createClient } from '@supabase/supabase-js'

// Variáveis do Vercel
const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_ANON_KEY || ''

// Criar cliente
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

// Log de verificação (apenas em dev)
if (process.env.VERCEL_ENV !== 'production') {
  console.log('🔧 Supabase configurado:', {
    urlPresent: !!supabaseUrl,
    keyPresent: !!supabaseKey,
    url: supabaseUrl ? '***' + supabaseUrl.slice(-20) : 'Não configurada'
  })
}