const https = require('https');

/**
 * ORIGENS
 * 0 = Blogspot (HOME fixa com ?m=1)
 * 1 = rdcanais (player dinâmico /{id})
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
      'Referer': `https://${DOMINIOS[0]}`
    };

    let fetched;
    let dominioUsado;

    /* ============================
       HOME → BLOGSPOT
    ============================ */
    if (path === '') {
      const url = `https://${DOMINIOS[0]}`;
      fetched = await fetchUrl(url, reqHeaders);
      dominioUsado = DOMINIOS[0];
    } 
    /* ============================
       PLAYER → RDCANAIS/{id}
    ============================ */
    else {
      const url = `https://${DOMINIOS[1]}${path}`;
      fetched = await fetchUrl(url, reqHeaders);
      dominioUsado = DOMINIOS[1];
    }

    const { res: respOrig, data } = fetched;

    /* ============================
       M3U8
    ============================ */
    if (/\.m3u8$/i.test(path)) {
      let playlist = data.replace(/(.*\.ts)/g, (match) => {
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

    /* ============================
       ARQUIVOS ESTÁTICOS
    ============================ */
    if (/\.(ts|mp4|webm|ogg|jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/i.test(path)) {
      const fileUrl =
        dominioUsado === DOMINIOS[0]
          ? `https://${DOMINIOS[0]}`
          : `https://${DOMINIOS[1]}${path}`;

      https.get(fileUrl, { headers: reqHeaders }, (streamResp) => {
        res.writeHead(streamResp.statusCode, streamResp.headers);
        streamResp.pipe(res);
      });
      return;
    }

    /* ============================
       HTML
    ============================ */
    if (respOrig.headers['content-type']?.includes('text/html')) {
      let html = data;

      const headers = { ...respOrig.headers };
      delete headers['x-frame-options'];
      delete headers['content-security-policy'];

      /* =================================================
         🔹 REPLACES EXPLÍCITOS – BLOGSPOT
      ================================================= */
      html = html
        .replace(
          /href=["']https?:\/\/puroplaynovo\.blogspot\.com\/2025\/06\/futebol-ao-vivo-gratis-reset-margin-0.html\?m=1["']/gi,
          'href="/"'
        )
        .replace(
          /src=["']https?:\/\/puroplaynovo\.blogspot\.com\/2025\/06\/futebol-ao-vivo-gratis-reset-margin-0.html\?m=1["']/gi,
          'src="/"'
        );

      /* =================================================
         🔹 REPLACES EXPLÍCITOS – RDCANAIS (QUALQUER {id})
      ================================================= */
      html = html
        .replace(
          /href=["']https?:\/\/rdcanais\.top\/([^"']+)["']/gi,
          'href="/$1"'
        )
        .replace(
          /src=["']https?:\/\/rdcanais\.top\/([^"']+)["']/gi,
          'src="/$1"'
        )
        .replace(
          /action=["']https?:\/\/rdcanais\.top\/([^"']+)["']/gi,
          'action="/$1"'
        )
        .replace(
          /url\(["']?https?:\/\/rdcanais\.top\/(.*?)["']?\)/gi,
          'url("/$1")'
        )
        .replace(
          /<iframe([^>]*)src=["']https?:\/\/rdcanais\.top\/([^"']+)["']/gi,
          '<iframe$1src="/$2"'
        );

      /* =================================================
         🔹 LIMPEZAS
      ================================================= */
      html = html
        .replace(/<base[^>]*>/gi, '')
        .replace(/<meta[^>]+http-equiv=["']refresh["'][^>]*>/gi, '')
        .replace(
          /(window|document)\.location(\.href)?\s*=\s*['"][^'"]+['"]/gi,
          ''
        );

      /* =================================================
         🔹 ESPAÇO PARA BANNER
      ================================================= */
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

    /* Outros tipos */
    res.writeHead(respOrig.statusCode, respOrig.headers);
    res.end(data);

  } catch (err) {
    console.error('Erro geral proxy:', err);
    res.statusCode = 500;
    res.end('Erro interno.');
  }
};
