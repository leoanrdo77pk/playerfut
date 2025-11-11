const https = require('https');

const DOMINIOS = [
  'embedtv.best',
  'embedtv-5.icu',
  'embedtv-6.icu',
  'embedtv-7.icu',
];

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
    let path = req.url === '/' ? '' : req.url;

    const reqHeaders = {
      'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
      'Referer': `https://${DOMINIOS[0]}/`,
    };

    let fetched = null;
    let dominioUsado = null;

    for (const dominio of DOMINIOS) {
      try {
        const url = `https://${dominio}${path}`;
        fetched = await fetchUrl(url, reqHeaders);
        dominioUsado = dominio;
        break;
      } catch (_) {}
    }

    if (!fetched) {
      res.statusCode = 404;
      return res.end('Conteúdo não encontrado em nenhum domínio.');
    }

    const { res: respOrig, data } = fetched;

    // Caso seja playlist .m3u8
    if (/\.m3u8$/i.test(path)) {
      let playlist = data.replace(/(.*\.ts)/g, (match) => {
        if (match.startsWith('http')) {
          return match.replace(new RegExp(`https?:\/\/${dominioUsado}\/`), '/');
        }
        return `/${match}`;
      });
      res.writeHead(200, {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(playlist);
    }

    // Proxy para assets (ts, mp4, img, css, js etc.)
    if (/\.(ts|mp4|webm|ogg|jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/i.test(path)) {
      const fileUrl = `https://${dominioUsado}${path.startsWith('/') ? path : '/' + path}`;
      https.get(fileUrl, { headers: reqHeaders }, (streamResp) => {
        res.writeHead(streamResp.statusCode, streamResp.headers);
        streamResp.pipe(res);
      }).on('error', (err) => {
        console.error('Erro proxy estático:', err);
        res.statusCode = 500;
        res.end('Erro ao carregar assets.');
      });
      return;
    }

    // Se for HTML
    if (respOrig.headers['content-type'] && respOrig.headers['content-type'].includes('text/html')) {
      let html = data;

      // Remove o <head> original por completo
      html = html.replace(/<head[\s\S]*?<\/head>/i, '');

      // Cria seu cabeçalho personalizado
      const meuHead = `
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="ppck-ver" content="82de547bce4b26acfb7d424fc45ca87d" />
  <title>Futebol ao Vivo</title>
  <link rel="stylesheet" href="/meu-estilo.css">
  <style>
    body { background: #000; color: #fff; font-family: Arial, sans-serif; margin: 0; padding: 0; }
    header { background: #111; padding: 10px; text-align: center; font-size: 20px; }
  </style>
</head>`;

      // Insere o novo <head> antes do <body>
      html = html.replace(/<body/i, `${meuHead}\n<body`);

      // Remove base e reescreve URLs
      const headers = { ...respOrig.headers };
      delete headers['x-frame-options'];
      delete headers['content-security-policy'];

      const dominioRegex = new RegExp(`https?:\/\/(?:${DOMINIOS.join('|')})\/`, 'g');
      html = html.replace(dominioRegex, '/');

      // Injetar banner no final do body
      if (html.includes('</body>')) {
        html = html.replace('</body>', `
<div id="custom-footer">
  <script type="text/javascript">
     var uid = '455197';
     var wid = '743023';
     var pop_tag = document.createElement('script');
     pop_tag.src='//cdn.popcash.net/show.js';
     document.body.appendChild(pop_tag);
     pop_tag.onerror = function() {
       pop_tag = document.createElement('script');
       pop_tag.src='//cdn2.popcash.net/show.js';
       document.body.appendChild(pop_tag);
     };
  </script>
</div>
<style>
  #custom-footer {
    position: fixed;
    bottom: 0; left: 0; width: 100%;
    background: transparent;
    text-align: center;
    z-index: 9999;
  }
  body { padding-bottom: 120px !important; }
</style>
</body>`);
      }

      res.writeHead(200, {
        ...headers,
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/html; charset=utf-8'
      });

      return res.end(html);
    }

    // Caso contrário, devolve o conteúdo puro
    res.writeHead(respOrig.statusCode, respOrig.headers);
    res.end(data);

  } catch (err) {
    console.error('Erro geral proxy:', err);
    res.statusCode = 500;
    res.end('Erro interno.');
  }
};
