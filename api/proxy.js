const https = require('https');

/**
 * BLOGSPOT FIXO (HOME)
 */
const BLOG_ORIGEM =
  'https://puroplaynovo.blogspot.com/2025/06/futebol-ao-vivo-gratis-reset-margin-0.html?m=1';

/**
 * DOMÍNIO REAL DO PLAYER (BACKEND)
 */
const PLAYER_BACKEND = 'rdcanais.top';

/**
 * EXTENSÕES DE ARQUIVOS (proxy direto)
 */
const STATIC_REGEX = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|mp4|webm|ts|m3u8)$/i;

function fetch(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => resolve({ res, data }));
    }).on('error', reject);
  });
}

module.exports = async (req, res) => {
  try {
    const path = req.url === '/' ? '/' : req.url;

    /* =====================================
       1️⃣ HOME → BLOGSPOT
    ===================================== */
    if (path === '/') {
      const { res: blogRes, data } = await fetch(BLOG_ORIGEM, {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
        Referer: BLOG_ORIGEM
      });

      let html = data;

      /* Reescreve links do Blogspot para ficar no seu domínio */
      html = html.replace(
        /https?:\/\/puroplaynovo\.blogspot\.com\/2025\/06\/futebol-ao-vivo-gratis-reset-margin-0.html\?m=1/gi,
        '/'
      );

      /* Remove redirects forçados */
      html = html.replace(
        /(window|document)\.location(\.href)?\s*=\s*['"][^'"]+['"]/gi,
        ''
      );

      /* Espaço para BIDVERTISER */
      const banner = `
<!-- BIDVERTISER -->
<div id="bidvertiser-banner"></div>
`;

      if (html.includes('</body>')) {
        html = html.replace('</body>', `${banner}</body>`);
      }

      const headers = { ...blogRes.headers };
      delete headers['x-frame-options'];
      delete headers['content-security-policy'];

      res.writeHead(200, {
        ...headers,
        'Content-Type': 'text/html; charset=utf-8'
      });

      return res.end(html);
    }

    /* =====================================
       2️⃣ PLAYER → RDCANAIS (INVISÍVEL)
    ===================================== */

    const backendUrl = `https://${PLAYER_BACKEND}${path}`;

    /* Arquivos estáticos / stream */
    if (STATIC_REGEX.test(path)) {
      https.get(
        backendUrl,
        {
          headers: {
            'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
            Referer: `https://${PLAYER_BACKEND}/`
          }
        },
        backendRes => {
          res.writeHead(backendRes.statusCode, backendRes.headers);
          backendRes.pipe(res);
        }
      ).on('error', () => {
        res.statusCode = 500;
        res.end('Erro ao carregar mídia');
      });
      return;
    }

    /* HTML do player */
    const { res: playerRes, data } = await fetch(backendUrl, {
      'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
      Referer: `https://${PLAYER_BACKEND}/`
    });

    let html = data;

    /* =====================================
       3️⃣ REWRITE TOTAL DO RDCANAIS
    ===================================== */

    /* Remove qualquer referência visível ao domínio */
    const rdRegex = new RegExp(`https?:\/\/${PLAYER_BACKEND}`, 'gi');
    html = html.replace(rdRegex, '');

    /* Reescreve src, href, action */
    html = html
      .replace(/src=["']\/([^"']+)["']/gi, 'src="/$1"')
      .replace(/href=["']\/([^"']+)["']/gi, 'href="/$1"')
      .replace(/action=["']\/([^"']+)["']/gi, 'action="/$1"');

    /* Remove base */
    html = html.replace(/<base[^>]*>/gi, '');

    /* Remove redirects JS */
    html = html.replace(
      /(window|document)\.location(\.href)?\s*=\s*['"][^'"]+['"]/gi,
      ''
    );

    /* Remove meta refresh */
    html = html.replace(
      /<meta[^>]+http-equiv=["']refresh["'][^>]*>/gi,
      ''
    );

    /* =====================================
       4️⃣ HEADERS LIMPOS
    ===================================== */

    const headers = { ...playerRes.headers };
    delete headers['x-frame-options'];
    delete headers['content-security-policy'];

    res.writeHead(200, {
      ...headers,
      'Content-Type': playerRes.headers['content-type'] || 'text/html'
    });

    res.end(html);

  } catch (err) {
    console.error('Erro geral:', err);
    res.statusCode = 500;
    res.end('Erro interno');
  }
};
