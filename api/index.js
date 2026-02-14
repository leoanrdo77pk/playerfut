const https = require('https');

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
function fetchUrl(url, reqHeaders) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: reqHeaders }, (res) => {
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
       1️⃣ SE NÃO FOR FUTEBOL7K → REDIRECIONA PARA SINALPUBLICO
    ====================================================== */
    if (!path.startsWith('/futebol7k') && path !== '') {
      const canal = path.replace('/', '');
      const playerUrl = `https://sinalpublico.vercel.app/play/dtv.html?id=${encodeURIComponent(canal)}`;

      res.writeHead(302, { Location: playerUrl });
      return res.end();
    }

    /* =====================================================
       2️⃣ TRATAR FUTEBOL7K
    ====================================================== */

    // Remove prefixo
    path = path.replace('/futebol7k', '') || '';

    const reqHeaders = {
      'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
      'Referer': `https://${DOMINIOS_FUTEBOL7K[0]}/`,
    };

    let fetched = null;
    let dominioUsado = null;

    // tenta todos os domínios
    for (const dominio of DOMINIOS_FUTEBOL7K) {
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

    /* =====================================================
       3️⃣ PLAYLIST M3U8
    ====================================================== */
    if (/\.m3u8$/i.test(path)) {
      let playlist = data.replace(/(.*\.ts)/g, (match) => {
        if (match.startsWith('http')) {
          return match.replace(new RegExp(`https?:\/\/${dominioUsado}\/`), '/futebol7k/');
        }
        return `/futebol7k/${match}`;
      });

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

    /* =====================================================
       5️⃣ HTML
    ====================================================== */
    if (respOrig.headers['content-type']?.includes('text/html')) {

      let html = data;

      const headers = { ...respOrig.headers };
      delete headers['x-frame-options'];
      delete headers['content-security-policy'];

      const dominioRegex = new RegExp(`https?:\/\/(?:${DOMINIOS_FUTEBOL7K.join('|')})\/`, 'g');
      html = html.replace(dominioRegex, '/futebol7k/');

      html = html
        .replace(/src=["']https?:\/\/(?:[^\/]+)\/([^"']+)["']/g, 'src="/futebol7k/$1"')
        .replace(/href=["']https?:\/\/(?:[^\/]+)\/([^"']+)["']/g, 'href="/futebol7k/$1"')
        .replace(/action=["']https?:\/\/(?:[^\/]+)\/([^"']+)["']/g, 'action="/futebol7k/$1"')
        .replace(/url\(["']?https?:\/\/(?:[^\/]+)\/(.*?)["']?\)/g, 'url("/futebol7k/$1")')
        .replace(/<iframe([^>]*)src=["']https?:\/\/(?:[^\/]+)\/([^"']+)["']/g, '<iframe$1src="/futebol7k/$2"')
        .replace(/<base[^>]*>/gi, '');

      // Remove header visual
      html = html
        .replace(/<header[\s\S]*?<\/header>/gi, '')
        .replace(/<nav[\s\S]*?<\/nav>/gi, '');

      // Troca título
      html = html.replace(/<title>[^<]*<\/title>/, '<title>Futebol ao Vivo</title>');

      res.writeHead(200, {
        ...headers,
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
