const https = require('https');

module.exports = async (req, res) => {
  try {
    const path = req.url.replace(/\?.*$/, '');

    const BLOGSPOT_URL =
      'https://puroplaynovo.blogspot.com/2025/06/futebol-ao-vivo-gratis-reset-margin-0.html';

    let targetUrl;

    // ==========================
    // DEFINIÇÃO DE ROTAS
    // ==========================
    if (path === '/' || path === '') {
      targetUrl = BLOGSPOT_URL;
    }

    // /rdcanais.top/espn/
    else if (path.startsWith('/rdcanais.top/')) {
      targetUrl =
        'https://rdcanais.top/' + path.replace('/rdcanais.top/', '');
    }

    // /espn  → força como player
    else {
      targetUrl = 'https://rdcanais.top' + path;
    }

    https.get(
      targetUrl,
      {
        headers: {
          'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
          'Referer': 'https://rdcanais.top/',
        },
      },
      (resp) => {
        let data = '';

        resp.setEncoding('utf8');
        resp.on('data', (chunk) => (data += chunk));

        resp.on('end', () => {
          try {
            // ==========================
            // HEADERS
            // ==========================
            const headers = { ...resp.headers };
            delete headers['x-frame-options'];
            delete headers['content-security-policy'];
            delete headers['content-length'];

            // ==========================
            // REWRITE HTML
            // ==========================
            data = data
              // blogspot → relativo
              .replace(
                /https:\/\/puroplaynovo\.blogspot\.com\/[^"'\s<>]+/gi,
                (m) => new URL(m).pathname
              )

              // rdcanais.top → relativo
              .replace(
                /https?:\/\/(?:www\.)?rdcanais\.top\/([^"'>\s]+)/gi,
                '/$1'
              )

              // bloquear window.location
              .replace(
                /window\.location(?:\.href)?\s*=\s*['"][^'"]+['"]/gi,
                ''
              )

              // bloquear meta refresh
              .replace(
                /<meta[^>]+http-equiv=["']refresh["'][^>]*>/gi,
                ''
              )

              // remover <base>
              .replace(/<base[^>]*>/gi, '');

            // ==========================
            // HEAD
            // ==========================
            data = data
              .replace(
                /<title>[\s\S]*?<\/title>/i,
                '<title>Futebol Ao Vivo</title>'
              )
              .replace(/<link[^>]*rel=["']icon["'][^>]*>/gi, '');

            // ⚠️ NÃO remover scripts (player depende deles)

            res.writeHead(200, {
              ...headers,
              'Access-Control-Allow-Origin': '*',
              'Content-Type':
                resp.headers['content-type'] || 'text/html; charset=utf-8',
            });

            res.end(data);
          } catch (err) {
            console.error('Erro ao processar HTML:', err);
            res.statusCode = 500;
            res.end('Erro ao processar conteúdo.');
          }
        });
      }
    ).on('error', (err) => {
      console.error('Erro ao buscar conteúdo:', err);
      res.statusCode = 500;
      res.end('Erro ao carregar conteúdo.');
    });
  } catch (err) {
    console.error('Erro geral:', err);
    res.statusCode = 500;
    res.end('Erro interno.');
  }
};
