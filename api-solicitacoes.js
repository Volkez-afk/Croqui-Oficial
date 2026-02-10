import { supabase } from './supabase-config.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  console.log(`📄 Solicitações - ${req.method} ${req.url}`)
  
  const urlParts = req.url.split('/')
  let idFromPath = null
  if (urlParts.length >= 3 && urlParts[2] !== '') {
    idFromPath = urlParts[2]
  }
  
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      const { tipo, nome, cpf, iptu, endereco, numeroImovel, bairro, quadra, lote, comprovacaoUrl } = body
      
      console.log('🔄 Criando nova solicitação para:', nome)
      
      if (!tipo || !nome || !iptu) {
        return res.status(400).json({ success: false, error: 'Campos obrigatórios faltando' })
      }
      
      const numero = `SOL-${Date.now().toString().slice(-6)}`
      
      const { data, error } = await supabase
        .from('solicitacoes')
        .insert([{
          numero,
          tipo,
          nome,
          cpf,
          iptu,
          endereco,
          numero_imovel: numeroImovel,
          bairro,
          quadra,
          lote,
          comprovacao_url: comprovacaoUrl,
          status: 'pendente'
        }])
        .select()
      
      if (error) {
        console.error('❌ Erro ao criar solicitação:', error)
        return res.status(500).json({ success: false, error: error.message })
      }
      
      console.log('✅ Solicitação criada:', data[0].numero)
      return res.status(200).json({ success: true, solicitacao: data[0] })
      
    } catch (error) {
      console.error('💥 Erro interno:', error)
      return res.status(500).json({ success: false, error: 'Erro interno do servidor' })
    }
  }
  
  if (req.method === 'GET') {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`)
      const status = url.searchParams.get('status')
      
      console.log('🔄 Buscando solicitações, status:', status || 'todos')
      
      let query = supabase.from('solicitacoes').select('*').order('data_criacao', { ascending: false })
      
      if (status) {
        query = query.eq('status', status)
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error('❌ Erro ao buscar solicitações:', error)
        return res.status(500).json({ success: false, error: error.message })
      }
      
      console.log(`✅ ${data.length} solicitações encontradas`)
      return res.status(200).json({ success: true, total: data.length, dados: data })
      
    } catch (error) {
      console.error('💥 Erro interno:', error)
      return res.status(500).json({ success: false, error: 'Erro interno do servidor' })
    }
  }
  
  if (req.method === 'PUT') {
    try {
      const solicitacaoId = idFromPath || req.query.id
      
      if (!solicitacaoId) {
        return res.status(400).json({ success: false, error: 'ID da solicitação é obrigatório' })
      }
      
      console.log('🔄 Atualizando solicitação:', solicitacaoId)
      
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      const updates = body
      
      const { data, error } = await supabase
        .from('solicitacoes')
        .update({
          ...updates,
          data_atualizacao: new Date().toISOString()
        })
        .eq('id', solicitacaoId)
        .select()
      
      if (error) {
        console.error('❌ Erro ao atualizar solicitação:', error)
        return res.status(500).json({ success: false, error: error.message })
      }
      
      if (!data || data.length === 0) {
        console.error('❌ Solicitação não encontrada:', solicitacaoId)
        return res.status(404).json({ success: false, error: 'Solicitação não encontrada' })
      }
      
      console.log('✅ Solicitação atualizada:', solicitacaoId)
      return res.status(200).json({ success: true, solicitacao: data[0] })
      
    } catch (error) {
      console.error('💥 Erro interno:', error)
      return res.status(500).json({ success: false, error: 'Erro interno do servidor' })
    }
  }
  
  console.warn('⚠️ Método não permitido:', req.method)
  return res.status(405).json({ success: false, error: 'Método não permitido' })
}