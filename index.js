const https = require('https');

const HOME_DOMAIN = 'puroplaynovo.blogspot.com';
const HOME_PATH =
  '/2025/06/futebol-ao-vivo-gratis-reset-margin-0.html?m=1';

const PLAYER_DOMAINS = ['rdcanais.top'];

function fetchUrl(url, reqHeaders) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: reqHeaders }, (res) => {
      if (res.statusCode === 200) {
        let data = '';
        res.on('data', chunk => data += chunk);
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
    const path = req.url === '/' ? '/' : req.url;

    let targetUrl;
    let dominioUsado;

    const reqHeaders = {
      'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
    };

    // ==========================
    // HOME
    // ==========================
    if (path === '/' || path === HOME_PATH) {
      targetUrl = `https://${HOME_DOMAIN}${HOME_PATH}`;
      dominioUsado = HOME_DOMAIN;
      reqHeaders.Referer = `https://${HOME_DOMAIN}/`;
    } else {
      // ==========================
      // PLAYER
      // ==========================
      targetUrl = `https://${PLAYER_DOMAINS[0]}${path}`;
      dominioUsado = PLAYER_DOMAINS[0];
      reqHeaders.Referer = `https://${PLAYER_DOMAINS[0]}/`;
    }

    const fetched = await fetchUrl(targetUrl, reqHeaders);
    const { res: respOrig, data } = fetched;

    // ==========================
    // M3U8
    // ==========================
    if (/\.m3u8$/i.test(path)) {
      let playlist = data.replace(
        new RegExp(`https?:\/\/${dominioUsado}\/`, 'g'),
        '/'
      );

      res.writeHead(200, {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(playlist);
    }

    // ==========================
    // ASSETS
    // ==========================
    if (/\.(ts|mp4|webm|ogg|jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/i.test(path)) {
      https.get(targetUrl, { headers: reqHeaders }, (streamResp) => {
        res.writeHead(streamResp.statusCode, streamResp.headers);
        streamResp.pipe(res);
      }).on('error', () => {
        res.statusCode = 500;
        res.end('Erro ao carregar asset.');
      });
      return;
    }

    // ==========================
    // HTML
    // ==========================
    if (
      respOrig.headers['content-type'] &&
      respOrig.headers['content-type'].includes('text/html')
    ) {
      let html = data;

      const headers = { ...respOrig.headers };
      delete headers['x-frame-options'];
      delete headers['content-security-policy'];

      // Rewrites
      html = html
        .replace(
          new RegExp(`https?:\/\/${HOME_DOMAIN}\/`, 'gi'),
          '/'
        )
        .replace(
          new RegExp(`https?:\/\/${PLAYER_DOMAINS.join('|')}\/`, 'gi'),
          '/'
        )
        .replace(/<base[^>]*>/gi, '');

      // Head
      html = html
        .replace(/<title>[^<]*<\/title>/i, '<title>Futebol ao Vivo</title>')
        .replace(/<link[^>]*rel=["']icon["'][^>]*>/gi, '')
        .replace(
          /<head>/i,
          `<head>
<meta name="ppck-ver" content="82de547bce4b26acfb7d424fc45ca87d" />`
        );

      // ==========================
      // ESPAÇO BIDVERTISE
      // ==========================
      if (html.includes('</body>')) {
        html = html.replace(
          '</body>',
          `
<!-- BIDVERTISE -->
<div id="bidvertise-banner">
  <!-- COLE SEU SCRIPT AQUI -->
</div>

</body>`
        );
      }

      res.writeHead(200, {
        ...headers,
        'Access-Control-Allow-Origin': '*',
        'Content-Type': respOrig.headers['content-type']
      });

      return res.end(html);
    }

    // Outros
    res.writeHead(respOrig.statusCode, respOrig.headers);
    res.end(data);

  } catch (err) {
    console.error('Erro geral proxy:', err);
    res.statusCode = 500;
    res.end('Erro interno.');
  }
};
