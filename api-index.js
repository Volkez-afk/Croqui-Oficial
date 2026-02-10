export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')
  
  res.status(200).json({
    status: 'API online',
    message: 'Sistema de Croqui Botucatu - Estrutura Plana',
    timestamp: new Date().toISOString(),
    endpoints: {
      login: '/api/login-servidor [POST]',
      servidores: '/api/servidores [GET,POST,PUT,DELETE]',
      solicitacoes: '/api/solicitacoes [GET,POST,PUT]',
      upload: '/api/upload [POST]'
    },
    note: 'Todos os arquivos na raiz do projeto'
  })
}