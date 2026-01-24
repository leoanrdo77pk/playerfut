const https = require('https');

const DOMINIOS = [
  'futemaxbr.tv',
  'www.futemaxbr.tv'
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
    const path = req.url === '/' ? '' : req.url;

    const reqHeaders = {
      'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Referer': `https://${DOMINIOS[0]}/`,
      'Accept': '*/*'
    };

    let fetched = null;
    let dominioUsado = null;

    // 🔁 Tenta todos os domínios
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
      return res.end('Conteúdo não encontrado.');
    }

    const { res: respOrig, data } = fetched;

    // 🔹 M3U8 → reescreve TS para proxy
    if (/\.m3u8$/i.test(path)) {
      let playlist = data.replace(/(.*\.ts)/g, (match) => {
        if (match.startsWith('http')) {
          return match.replace(
            new RegExp(`https?:\/\/${dominioUsado}\/`, 'i'),
            '/'
          );
        }
        return `/${match}`;
      });

      res.writeHead(200, {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(playlist);
    }

    // 🔹 Proxy arquivos estáticos
    if (/\.(ts|mp4|webm|ogg|jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/i.test(path)) {
      const fileUrl = `https://${dominioUsado}${path.startsWith('/') ? path : '/' + path}`;
      https.get(fileUrl, { headers: reqHeaders }, (streamResp) => {
        res.writeHead(streamResp.statusCode, streamResp.headers);
        streamResp.pipe(res);
      }).on('error', () => {
        res.statusCode = 500;
        res.end('Erro ao carregar asset.');
      });
      return;
    }

    // 🔹 HTML
    if (respOrig.headers['content-type']?.includes('text/html')) {
      let html = data;

      const headers = { ...respOrig.headers };
      delete headers['x-frame-options'];
      delete headers['content-security-policy'];

      // Reescreve domínios
      const dominioRegex = new RegExp(`https?:\/\/(?:${DOMINIOS.join('|')})\/`, 'gi');
      html = html.replace(dominioRegex, '/');

      // Reescrita de links Futemax
      html = html
        .replace(/src=["']https?:\/\/(?:futemaxbr[^\/]+)\/([^"']+)["']/gi, 'src="/$1"')
        .replace(/href=["']https?:\/\/(?:futemaxbr[^\/]+)\/([^"']+)["']/gi, 'href="/$1"')
        .replace(/action=["']https?:\/\/(?:futemaxbr[^\/]+)\/([^"']+)["']/gi, 'action="/$1"')
        .replace(/url\(["']?https?:\/\/(?:futemaxbr[^\/]+)\/(.*?)["']?\)/gi, 'url("/$1")')
        .replace(/<iframe([^>]*)src=["']https?:\/\/(?:futemaxbr[^\/]+)\/([^"']+)["']/gi, '<iframe$1src="/$2"')
        .replace(/<base[^>]*>/gi, '');

      // Remove cabeçalhos e menus
      html = html
        .replace(/<header[\s\S]*?<\/header>/gi, '')
        .replace(/<nav[\s\S]*?<\/nav>/gi, '')
        .replace(/<div[^>]*id=["']header["'][^>]*>[\s\S]*?<\/div>/gi, '');

      // Título e favicon
      html = html
        .replace(/<title>[^<]*<\/title>/i, '<title>Futebol ao Vivo</title>')
        .replace(/<link[^>]*rel=["']icon["'][^>]*>/gi, '');

      // Meta verificação
      html = html.replace(
        /<head>/i,
        `<head>
<meta name="ppck-ver" content="82de547bce4b26acfb7d424fc45ca87d" />`
      );

      // Banner final
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
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 9999;
}
body { padding-bottom: 120px !important; }
</style>
</body>`);
      }

      res.writeHead(200, {
        ...headers,
        'Access-Control-Allow-Origin': '*',
        'Content-Type': headers['content-type'] || 'text/html'
      });
      return res.end(html);
    }

    // Outros conteúdos
    res.writeHead(respOrig.statusCode, respOrig.headers);
    res.end(data);

  } catch (err) {
    console.error('Erro geral proxy:', err);
    res.statusCode = 500;
    res.end('Erro interno.');
  }
};
