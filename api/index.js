module.exports = (req, res) => {
  try {
    let canal = req.url.split('?')[0];
    canal = canal.replace(/^\/+/, '').toLowerCase();

    if (!canal || canal === 'favicon.ico') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Canal não informado');
    }

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
