const https = require('https');

module.exports = async (req, res) => {
  const path = req.url === '/' ? '' : req.url;
  const targetUrl = 'https://futebol7k.com' + path;

  https.get(targetUrl, {
    headers: {
      'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
      'Referer': 'https://futebol7k.com',
    }
  }, (resp) => {
    let data = '';

    resp.on('data', chunk => data += chunk);
    resp.on('end', () => {
      // 🔁 Reescreve todos os links e ações para manter o usuário no Vercel
      data = data
        // Links absolutos → relativos
        .replace(/https:\/\/futebol7k\.com\//g, '/')
        // href='/algo'
        .replace(/href='\/([^']+)'/g, "href='/$1'")
        // href="/algo"
        .replace(/href="\/([^"]+)"/g, 'href="/$1"')
        // action="/algo"
        .replace(/action="\/([^"]+)"/g, 'action="/$1"')
        // Remove <base> se existir
        .replace(/<base[^>]*>/gi, '');

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', resp.headers['content-type'] || 'text/html');
      res.statusCode = 200;
      res.end(data);
    });
  }).on("error", (err) => {
    console.error("Erro:", err.message);
    res.statusCode = 500;
    res.end("Erro ao carregar conteúdo");
  });
};


