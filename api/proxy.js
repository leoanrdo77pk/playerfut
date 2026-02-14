const https = require('https');

module.exports = (req, res) => {
  try {
    const url = req.url;

    // Esperado: /api/proxy?url=/jogo.php?id=123
    const target = new URL('https://futebol7k.com' + url.replace(/^\/api\/proxy/, ''));

    const options = {
      hostname: target.hostname,
      path: target.pathname + target.search,
      method: 'GET',
      headers: {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
        'Referer': 'https://futebol7k.com/',
        'Origin': 'https://futebol7k.com'
      }
    };

    https.request(options, response => {
      let body = '';

      response.on('data', chunk => body += chunk);

      response.on('end', () => {

        const headers = { ...response.headers };

        // remove proteções que impedem iframe
        delete headers['x-frame-options'];
        delete headers['content-security-policy'];

        // Se for HTML, reescreve links internos
        if (headers['content-type']?.includes('text/html')) {
          body = body
            .replace(/https?:\/\/futebol7k\.com/gi, '/api/proxy')
            .replace(/\/\/futebol7k\.com/gi, '/api/proxy');
        }

        res.writeHead(response.statusCode, headers);
        res.end(body);
      });

    }).on('error', err => {
      res.writeHead(500);
      res.end('Erro no proxy');
    }).end();

  } catch (err) {
    res.writeHead(500);
    res.end('Erro interno');
  }
};
