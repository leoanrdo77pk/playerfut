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
      // Reescreve todos os links internos para apontar pro seu domínio
      data = data.replace(/href="\/([^"]+)"/g, 'href="/$1"');
      data = data.replace(/href='\/([^']+)'/g, "href='/$1'");
      data = data.replace(/action="\/([^"]+)"/g, 'action="/$1"');
      data = data.replace(/<base[^>]*>/g, ''); // remove <base> se tiver

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
