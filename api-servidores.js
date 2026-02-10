// NOTA: Importação corrigida para estrutura plana
import { supabase } from './supabase-config.js'

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  console.log(`📦 API Servidores - ${req.method} ${req.url}`)
  
  // Suporte a /api/servidores/123
  const urlParts = req.url.split('/')
  let idFromPath = null
  if (urlParts.length >= 3 && urlParts[2] !== '') {
    idFromPath = urlParts[2]
  }
  
  // GET: Listar servidores
  if (req.method === 'GET') {
    try {
      if (idFromPath) {
        // Buscar servidor específico
        const { data, error } = await supabase
          .from('servidores')
          .select('id, ri, nome, data_criacao')
          .eq('id', idFromPath)
          .single()
        
        if (error || !data) {
          return res.status(404).json({ success: false, error: 'Servidor não encontrado' })
        }
        
        return res.status(200).json({ success: true, dados: data })
      }
      
      // Listar todos os servidores
      const { data, error } = await supabase
        .from('servidores')
        .select('id, ri, nome, data_criacao')
        .order('nome', { ascending: true })
      
      if (error) {
        return res.status(500).json({ success: false, error: error.message })
      }
      
      return res.status(200).json({
        success: true,
        total: data.length,
        dados: data
      })
      
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Erro interno do servidor' })
    }
  }
  
  // POST: Criar servidor
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      const { ri, nome, senha } = body
      
      if (!ri || !nome || !senha) {
        return res.status(400).json({ success: false, error: 'RI, nome e senha são obrigatórios' })
      }
      
      // Verificar se RI já existe
      const { data: existing } = await supabase
        .from('servidores')
        .select('ri')
        .eq('ri', ri)
        .single()
      
      if (existing) {
        return res.status(409).json({ success: false, error: 'RI já está cadastrado' })
      }
      
      const { data, error } = await supabase
        .from('servidores')
        .insert([{ ri, nome, senha, data_criacao: new Date().toISOString() }])
        .select('id, ri, nome, data_criacao')
      
      if (error) {
        return res.status(500).json({ success: false, error: error.message })
      }
      
      return res.status(201).json({
        success: true,
        servidor: data[0],
        mensagem: 'Servidor cadastrado com sucesso'
      })
      
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Erro interno do servidor' })
    }
  }
  
  // PUT e DELETE (mantenha a lógica similar, adaptando imports)
  
  return res.status(405).json({ success: false, error: 'Método não permitido' })
}