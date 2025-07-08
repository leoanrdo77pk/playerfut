
const https = require('https');

module.exports = async (req, res) => {
  const targetUrl = 'https://futebol7k.com' + req.url;

  https.get(targetUrl, { headers: {
    'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
    'Referer': 'https://futebol7k.com'
  }}, (resp) => {
    let data = '';

    resp.on('data', chunk => data += chunk);
    resp.on('end', () => {
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
