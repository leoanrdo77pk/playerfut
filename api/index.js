const https = require('https');

const PLAYER_BASE = 'https://www2.embedtv.best';

// lista de canais aceitos
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

    // ignora favicon
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
        // remove proteções básicas
        res.removeHeader('X-Frame-Options');
        res.removeHeader('Content-Security-Policy');

        // reescreve links absolutos → relativos
        html = html
          .replace(/https?:\/\/www2\.embedtv\.best/gi, '')
          .replace(/https?:\/\/embedtv\.best/gi, '')
          .replace(/href="\//gi, 'href="/')
          .replace(/src="\//gi, 'src="/');

        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        });

        res.end(html);
      });
    }).on('error', (err) => {
      console.error('Erro proxy:', err);
      res.statusCode = 500;
      res.end('Erro ao carregar player');
    });

  } catch (err) {
    console.error('Erro geral:', err);
    res.statusCode = 500;
    res.end('Erro interno');
  }
};
