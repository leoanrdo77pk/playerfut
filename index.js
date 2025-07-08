const https = require('https');

module.exports = async (req, res) => {
  const path = req.url.replace(/^\/proxy/, '') || '/';
  const targetUrl = 'https://futebol7k.com' + path;

  https.get(targetUrl, {
    headers: {
      'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
      'Referer': 'https://futebol7k.com'
    }
  }, (response) => {
    let data = '';
    const contentType = response.headers['content-type'] || 'text/html';

    response.on('data', chunk => data += chunk);
    response.on('end', () => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', contentType);
      res.status(200).send(data);
    });
  }).on('error', (err) => {
    console.error(err.message);
    res.status(500).send('Erro ao carregar conteúdo');
  });
};
