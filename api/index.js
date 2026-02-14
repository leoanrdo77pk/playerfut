const https = require('https');

module.exports = (req, res) => {

  let path = req.url === '/' ? '' : req.url;

  const isNumero = /^\/\d+$/.test(path);

  let targetHost;
  let targetPath;

  // ===============================
  // 🔹 CASO 1 – JOGO FUTEBOL (ID)
  // ===============================
  if (isNumero) {
    const id = path.replace('/', '');
    targetHost = 'futebol7k.com';
    targetPath = `/jogo.php?id=${id}`;
  }

  // ===============================
  // 🔹 CASO 2 – CANAIS (SINALPUBLICO)
  // ===============================
  else {
    const canal = path.replace('/', '');

    if (!canal) {
      res.statusCode = 404;
      return res.end('Canal não informado');
    }

    const playerUrl = `https://sinalpublico.vercel.app/play/dtv.html?id=${encodeURIComponent(canal)}`;

    return res.writeHead(302, {
      Location: playerUrl
    }).end();
  }

  // ===============================
  // 🔹 PROXY FUTEBOL7K
  // ===============================
  const options = {
    hostname: targetHost,
    path: targetPath,
    method: 'GET',
    headers: {
      'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
      'Referer': `https://${targetHost}/`,
      'Origin': `https://${targetHost}`
    }
  };

  const proxy = https.request(options, (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {

      // 🔒 BLOQUEAR SE TENTAR REDIRECIONAR PRO DOMÍNIO ORIGINAL
      if (data.includes('futebol7k.com')) {
        data = data
          .replace(/https?:\/\/futebol7k\.com/gi, '')
          .replace(/\/\/futebol7k\.com/gi, '');
      }

      // 🔁 REESCREVER LINKS INTERNOS
      data = data.replace(
        /jogo\.php\?id=(\d+)/gi,
        '/$1'
      );

      res.setHeader('Content-Type', response.headers['content-type'] || 'text/html');
      res.end(data);
    });
  });

  proxy.on('error', (err) => {
    res.statusCode = 500;
    res.end('Erro no proxy');
  });

  proxy.end();
};
