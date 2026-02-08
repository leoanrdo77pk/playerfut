const https = require('https');

const PLAYER_BASE = 'https://rdcanais.top';

// canais permitidos
const CANAIS = [
  'espn',
  'premiere',
  'sportv',
  'combate',
  'ufc',
  'tnt',
  'bandsports'
];

module.exports = (req, res) => {
  try {
    let path = req.url.split('?')[0];
    path = path.replace(/^\/+/, '').toLowerCase();

    // ignora raiz e favicon
    if (!path || path === 'favicon.ico') {
      res.statusCode = 404;
      return res.end('Canal não informado');
    }

    // valida canal
    if (!CANAIS.includes(path)) {
      res.statusCode = 404;
      return res.end('Canal inválido');
    }

    const targetUrl = `${PLAYER_BASE}/${path}`;

    const headers = {
      'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
      'Referer': PLAYER_BASE,
      'Origin': PLAYER_BASE
    };

    https.get(targetUrl, { headers }, (resp) => {
      let html = '';

      resp.setEncoding('utf8');
      resp.on('data', chunk => (html += chunk));

      resp.on('end', () => {
        // remove headers de bloqueio
        const responseHeaders = { ...resp.headers };
        delete responseHeaders['x-frame-options'];
        delete responseHeaders['content-security-policy'];

        // reescreve links para não sair do domínio
        html = html
          .replace(/https?:\/\/(?:www\.)?rdcanais\.top/gi, '')
          .replace(/window\.location\s*=\s*['"][^'"]+['"]/gi, '')
          .replace(/<meta[^>]+http-equiv=["']refresh["'][^>]*>/gi, '')
          .replace(/<base[^>]*>/gi, '');

        res.writeHead(200, {
          ...responseHeaders,
          'Content-Type': 'text/html; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        });

        res.end(html);
      });
    }).on('error', (err) => {
      console.error('Erro ao carregar player:', err);
      res.statusCode = 500;
      res.end('Erro ao carregar o player');
    });

  } catch (err) {
    console.error('Erro geral:', err);
    res.statusCode = 500;
    res.end('Erro interno');
  }
};
