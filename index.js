const https = require('https');

module.exports = async (req, res) => {
  try {
    const path = req.url.replace(/\?.*$/, '');

    if (!path || path === '/') {
      res.statusCode = 404;
      return res.end('Canal não informado');
    }

    // /premiere → premiere
    const canal = path.replace(/^\/+/, '');

    const targetUrl = `https://www6.redecanaistv.in/ao-vivo/${canal}/`;

    https.get(
      targetUrl,
      {
        headers: {
          'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
          'Referer': 'https://www6.redecanaistv.in/',
        },
      },
      (resp) => {
        let data = '';

        resp.setEncoding('utf8');
        resp.on('data', chunk => (data += chunk));

        resp.on('end', () => {
          try {
            data = data
              // remove domínio absoluto
              .replace(/https?:\/\/www6\.redecanaistv\.in/gi, '')
              // remove redirects JS
              .replace(/window\.location[^;]+;/gi, '')
              // remove meta refresh
              .replace(/<meta[^>]+http-equiv=["']refresh["'][^>]*>/gi, '')
              // remove base
              .replace(/<base[^>]*>/gi, '');

            res.writeHead(200, {
              'Content-Type':
                resp.headers['content-type'] || 'text/html; charset=utf-8',
              'Access-Control-Allow-Origin': '*',
            });

            res.end(data);
          } catch (e) {
            console.error(e);
            res.statusCode = 500;
            res.end('Erro ao processar player');
          }
        });
      }
    ).on('error', () => {
      res.statusCode = 500;
      res.end('Erro ao carregar o player');
    });
  } catch (err) {
    res.statusCode = 500;
    res.end('Erro interno');
  }
};
