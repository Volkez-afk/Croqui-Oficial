// NOTA: Importação corrigida para estrutura plana
import { supabase } from './supabase-config.js'

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Método não permitido. Use POST.',
      received: req.method 
    })
  }
  
  try {
    // Obter dados do corpo
    let body
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    } catch (e) {
      return res.status(400).json({ 
        success: false, 
        error: 'JSON inválido no corpo da requisição' 
      })
    }
    
    const { ri, senha } = body
    
    console.log('🔐 Tentativa de login para RI:', ri)
    
    if (!ri || !senha) {
      return res.status(400).json({ 
        success: false, 
        error: 'RI e senha são obrigatórios',
        received: { ri: !!ri, senha: !!senha }
      })
    }
    
    // Buscar servidor no Supabase
    const { data, error } = await supabase
      .from('servidores')
      .select('*')
      .eq('ri', ri)
      .eq('senha', senha)
      .single()
    
    if (error) {
      console.error('❌ Erro no login:', error.message)
      return res.status(401).json({ 
        success: false, 
        error: 'Credenciais inválidas',
        details: error.message 
      })
    }
    
    if (!data) {
      return res.status(404).json({ 
        success: false, 
        error: 'Servidor não encontrado' 
      })
    }
    
    console.log('✅ Login bem-sucedido:', data.nome)
    
    // Retornar dados do usuário (SEM a senha)
    const usuario = {
      id: data.id,
      ri: data.ri,
      nome: data.nome,
      tipo: 'servidor',
      data_criacao: data.data_criacao
    }
    
    return res.status(200).json({
      success: true,
      usuario,
      token: Buffer.from(`${data.id}:${Date.now()}`).toString('base64'),
      message: 'Login realizado com sucesso'
    })
    
  } catch (error) {
    console.error('💥 Erro interno no servidor:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: process.env.VERCEL_ENV === 'development' ? error.message : undefined
    })
  }
}