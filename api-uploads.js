import { supabase } from './supabase-config.js'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  console.log(`📤 Upload - ${req.method} ${req.url}`)
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido' })
  }
  
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const { filename, fileContent } = body
    
    console.log('🔄 Processando upload:', filename)
    
    if (!filename || !fileContent) {
      return res.status(400).json({ success: false, error: 'Nome do arquivo e conteúdo são obrigatórios' })
    }
    
    const buffer = Buffer.from(fileContent, 'base64')
    
    const caminhoArquivo = `comprovantes/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    
    console.log('📁 Enviando para bucket:', caminhoArquivo)
    
    const { data, error } = await supabase.storage
      .from('pdfs-croqui')
      .upload(caminhoArquivo, buffer, {
        contentType: 'application/pdf',
        upsert: false
      })
    
    if (error) {
      console.error('❌ Erro no upload para o Supabase Storage:', error)
      return res.status(500).json({ success: false, error: 'Falha no upload do arquivo: ' + error.message })
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('pdfs-croqui')
      .getPublicUrl(data.path)
    
    console.log('✅ Upload concluído:', publicUrl)
    
    return res.status(200).json({
      success: true,
      arquivo: {
        nomeOriginal: filename,
        url: publicUrl,
        caminho: data.path,
        tamanho: buffer.length
      }
    })
    
  } catch (error) {
    console.error('💥 Erro interno no upload:', error)
    return res.status(500).json({ success: false, error: 'Erro interno do servidor durante o upload' })
  }
}