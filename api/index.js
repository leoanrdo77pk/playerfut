const https = require('https');

module.exports = (req, res) => {
  try {
    const url = req.url;

    /* =================================================
       🔒 BLOQUEAR ACESSO DIRETO AO DOMÍNIO REAL
       Se alguém tentar acessar algo contendo futebol7k.com direto
    ================================================= */
    if (url.includes('futebol7k.com')) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      return res.end('Acesso direto não permitido');
    }

    /* =================================================
       🎭 PROXY DO FUTEBOL7K (MASCARADO)
       /futebol7k/jogo.php?id=123
       → https://futebol7k.com/jogo.php?id=123
    ================================================= */
    if (url.startsWith('/futebol7k/')) {

      const targetPath = url.replace('/futebol7k', '');

      const options = {
        hostname: 'futebol7k.com',
        path: targetPath,
        method: 'GET',
        headers: {
          'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
          'Referer': 'https://futebol7k.com/jogo.php?id=',
          'Origin': 'https://futebol7k.com/jogo.php?id='
        }
      };

      https.request(options, response => {

        // Remove possíveis proteções de frame
        const headers = { ...response.headers };
        delete headers['x-frame-options'];
        delete headers['content-security-policy'];

        res.writeHead(response.statusCode, headers);
        response.pipe(res);

      }).on('error', () => {
        res.writeHead(500);
        res.end('Erro ao carregar player');
      }).end();

      return;
    }

    /* =================================================
       🎥 SISTEMA NORMAL DO SEU PLAYER
    ================================================= */

    let canal = url.split('?')[0];
    canal = canal.replace(/^\/+/, '').toLowerCase();

    if (!canal || canal === 'favicon.ico') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Canal não informado');
    }

    // Seu player atual
    const playerUrl = `https://sinalpublico.vercel.app/play/dtv.html?id=${encodeURIComponent(canal)}`;

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    });

    res.end(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>${canal.toUpperCase()} - PlayerFut</title>
<meta name="viewport" content="width=device-width, initial-scale=1">

<style>
  html, body {
    margin: 0;
    padding: 0;
    background: #000;
  }

  iframe {
    width: 100%;
    height: 100vh;
    border: 0;
    display: block;
  }
</style>
</head>

<body>
  <iframe 
    src="${playerUrl}"
    allowfullscreen
    allow="autoplay; encrypted-media; picture-in-picture">
  </iframe>
</body>
</html>`);

  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Erro interno');
  }
};
