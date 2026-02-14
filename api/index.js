const https = require('https');
const { URL } = require('url');

/* =========================
   DOMÍNIOS FUTEBOL7K
========================= */
const DOMINIOS_FUTEBOL7K = [
  'futebol7k.com',
  'www.futebol7k.com'
];

/* =========================
   FUNÇÃO FETCH
========================= */
function fetchUrl(url, headers) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {

      // Redirecionamento automático
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location, headers)
          .then(resolve)
          .catch(reject);
      }

      if (res.statusCode >= 200 && res.statusCode < 300) {
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

/* =========================
   EXPORT PRINCIPAL
========================= */
module.exports = async (req, res) => {
  try {

    let path = req.url === '/' ? '' : req.url;

    /* =====================================================
       1️⃣ REDIRECIONAMENTO PARA SINALPUBLICO
    ====================================================== */
    if (!path.startsWith('/futebol7k') && path !== '') {

      const canal = path.replace('/', '');
      const playerUrl = `https://sinalpublico.vercel.app/play/dtv.html?id=${encodeURIComponent(canal)}`;

      res.writeHead(302, { Location: playerUrl });
      return res.end();
    }

    /* =====================================================
       2️⃣ FUTEBOL7K
    ====================================================== */

    // Remove prefixo
    path = path.replace('/futebol7k', '') || '';

    // 🔹 Atalho /futebol7k/12999
    if (/^\/\d+$/.test(path)) {
      const id = path.replace('/', '');
      path = `/jogo.php?id=${id}`;
    }

    const headers = {
      'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
      'Referer': `https://${DOMINIOS_FUTEBOL7K[0]}/`,
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      'Accept': '*/*'
    };

    let fetched = null;
    let dominioUsado = null;

    for (const dominio of DOMINIOS_FUTEBOL7K) {
      try {
        const targetUrl = `https://${dominio}${path}`;
        fetched = await fetchUrl(targetUrl, headers);
        dominioUsado = dominio;
        break;
      } catch (_) {}
    }

    if (!fetched) {
      res.statusCode = 404;
      return res.end('Conteúdo não encontrado.');
    }

    const { res: respOrig, data } = fetched;

    /* =====================================================
       3️⃣ M3U8
    ====================================================== */
    if (/\.m3u8$/i.test(path)) {

      let playlist = data.replace(
        new RegExp(`https?:\/\/${dominioUsado}`, 'g'),
        '/futebol7k'
      );

      res.writeHead(200, {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Access-Control-Allow-Origin': '*'
      });

      return res.end(playlist);
    }

    /* =====================================================
       4️⃣ ARQUIVOS ESTÁTICOS
    ====================================================== */
    if (/\.(ts|mp4|webm|ogg|jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/i.test(path)) {

      const fileUrl = `https://${dominioUsado}${path.startsWith('/') ? path : '/' + path}`;

      https.get(fileUrl, { headers }, (streamResp) => {
        res.writeHead(streamResp.statusCode, streamResp.headers);
        streamResp.pipe(res);
      }).on('error', () => {
        res.statusCode = 500;
        res.end('Erro ao carregar asset.');
      });

      return;
    }

    /* =====================================================
       5️⃣ HTML DINÂMICO (PLAYER + IFRAME + AJAX)
    ====================================================== */
    if (respOrig.headers['content-type']?.includes('text/html')) {

      let html = data;

      const newHeaders = { ...respOrig.headers };
      delete newHeaders['x-frame-options'];
      delete newHeaders['content-security-policy'];

      const dominioRegex = new RegExp(`https?:\/\/(?:${DOMINIOS_FUTEBOL7K.join('|')})`, 'g');

      // Reescreve domínio principal
      html = html.replace(dominioRegex, '/futebol7k');

      // Reescreve src, href, action absolutos
      html = html
        .replace(/src=["']https?:\/\/([^"']+)["']/gi, 'src="/futebol7k/https://$1"')
        .replace(/href=["']https?:\/\/([^"']+)["']/gi, 'href="/futebol7k/https://$1"')
        .replace(/action=["']https?:\/\/([^"']+)["']/gi, 'action="/futebol7k/https://$1"');

      // Reescreve caminhos relativos
      html = html
        .replace(/src=["']\/([^"']+)["']/g, 'src="/futebol7k/$1"')
        .replace(/href=["']\/([^"']+)["']/g, 'href="/futebol7k/$1"')
        .replace(/action=["']\/([^"']+)["']/g, 'action="/futebol7k/$1"');

      // Reescreve fetch/ajax
      html = html.replace(
        /fetch\(["']https?:\/\/([^"']+)["']\)/g,
        'fetch("/futebol7k/https://$1")'
      );

      // Remove base tag
      html = html.replace(/<base[^>]*>/gi, '');

      // Remove header/nav visual
      html = html
        .replace(/<header[\s\S]*?<\/header>/gi, '')
        .replace(/<nav[\s\S]*?<\/nav>/gi, '');

      // Troca título
      html = html.replace(
        /<title>[^<]*<\/title>/,
        '<title>Futebol ao Vivo</title>'
      );

      res.writeHead(200, {
        ...newHeaders,
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/html'
      });

      return res.end(html);
    }

    /* =====================================================
       6️⃣ OUTROS TIPOS
    ====================================================== */
    res.writeHead(respOrig.statusCode, respOrig.headers);
    res.end(data);

  } catch (err) {
    console.error('Erro geral proxy:', err);
    res.statusCode = 500;
    res.end('Erro interno.');
  }
};
