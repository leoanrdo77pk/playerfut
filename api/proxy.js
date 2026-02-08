const https = require('https');

/**
 * ORIGENS (ordem importa)
 * 0 = Blogspot (home)
 * 1 = rdcanais (player)
 */
const DOMINIOS = [
  'puroplaynovo.blogspot.com/2025/06/futebol-ao-vivo-gratis-reset-margin-0.html?m=1',
  'rdcanais.top'
];

function fetchUrl(url, reqHeaders) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: reqHeaders }, (res) => {
      if (res.statusCode === 200) {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => resolve({ res, data }));
      } else {
        res.resume();
        reject(new Error('Status ' + res.statusCode));
      }
    }).on('error', reject);
  });
}

module.exports = async (req, res) => {
  try {
    const path = req.url === '/' ? '' : req.url;

    const reqHeaders = {
      'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
      'Referer': DOMINIOS[0]
    };

    let fetched = null;
    let dominioUsado = null;

    /* =============================
       BLOGSPOT (HOME)
    ============================= */
    if (path === '') {
      const url = `https://${DOMINIOS[0]}`;
      fetched = await fetchUrl(url, reqHeaders);
      dominioUsado = DOMINIOS[0];
    } else {
      /* =============================
         PLAYER (rdcanais/{id})
      ============================= */
      const url = `https://${DOMINIOS[1]}${path}`;
      fetched = await fetchUrl(url, reqHeaders);
      dominioUsado = DOMINIOS[1];
    }

    const { res: respOrig, data } = fetched;

    /* =============================
       M3U8
    ============================= */
    if (/\.m3u8$/i.test(path)) {
      let playlist = data.replace(/(.*\.ts)/g, match => {
        if (match.startsWith('http')) {
          return match.replace(/https?:\/\/[^\/]+\//, '/');
        }
        return `/${match}`;
      });

      res.writeHead(200, {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(playlist);
    }

    /* =============================
       ARQUIVOS ESTÁTICOS
    ============================= */
    if (/\.(ts|mp4|webm|ogg|jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/i.test(path)) {
      const fileUrl =
        dominioUsado === DOMINIOS[0]
          ? `https://${DOMINIOS[0]}`
          : `https://${DOMINIOS[1]}${path}`;

      https.get(fileUrl, { headers: reqHeaders }, streamResp => {
        res.writeHead(streamResp.statusCode, streamResp.headers);
        streamResp.pipe(res);
      });
      return;
    }

    /* =============================
       HTML
    ============================= */
    if (respOrig.headers['content-type']?.includes('text/html')) {
      let html = data;

      /* Remove headers de bloqueio */
      const headers = { ...respOrig.headers };
      delete headers['x-frame-options'];
      delete headers['content-security-policy'];

      /* 🔥 REMOVE URL VISÍVEL DO BLOG */
      html = html.replace(
        /https?:\/\/puroplaynovo\.blogspot\.com\/2025\/06\/futebol-ao-vivo-gratis-reset-margin-0.html\?m=1/gi,
        '/'
      );

      /* 🔥 REMOVE URL VISÍVEL DO RDCANAIS (QUALQUER ID) */
      html = html.replace(
        /https?:\/\/rdcanais\.top\/([^"'<>\\s]+)/gi,
        '/$1'
      );

      /* src / href / action */
      html = html
        .replace(/src=["']https?:\/\/[^\/]+\/([^"']+)["']/gi, 'src="/$1"')
        .replace(/href=["']https?:\/\/[^\/]+\/([^"']+)["']/gi, 'href="/$1"')
        .replace(/action=["']https?:\/\/[^\/]+\/([^"']+)["']/gi, 'action="/$1"')
        .replace(/url\(["']?https?:\/\/[^\/]+\/(.*?)["']?\)/gi, 'url("/$1")')
        .replace(/<iframe([^>]*)src=["']https?:\/\/[^\/]+\/([^"']+)["']/gi, '<iframe$1src="/$2"')
        .replace(/<base[^>]*>/gi, '');

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

      /* ===== ESPAÇO PARA SEU BANNER ===== */
      html = html.replace(
        '</body>',
        `
<!-- SEU BANNER AQUI -->
<div id="custom-banner"></div>
</body>`
      );

      res.writeHead(200, {
        ...headers,
        'Access-Control-Allow-Origin': '*',
        'Content-Type': respOrig.headers['content-type']
      });

      return res.end(html);
    }

    /* Outros */
    res.writeHead(respOrig.statusCode, respOrig.headers);
    res.end(data);

  } catch (err) {
    console.error('Erro geral proxy:', err);
    res.statusCode = 500;
    res.end('Erro interno.');
  }
};
