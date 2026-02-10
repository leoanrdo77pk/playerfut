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

    res.end(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Assistir ${canal.toUpperCase()} Ao Vivo</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: #000;
      overflow: hidden;
    }

    #playerWrapper {
      width: 100%;
      height: 100%;
    }

    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }

    /* dica visual só no mobile */
    #rotateHint {
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,.6);
      color: #fff;
      font-size: 12px;
      padding: 6px 10px;
      border-radius: 6px;
      z-index: 9999;
    }
  </style>
</head>
<body>

<div id="rotateHint">🔄 Gire o celular</div>

<div id="playerWrapper">
  <iframe 
    id="playerFrame"
    src="${playerUrl}" 
    allowfullscreen
    allow="autoplay; encrypted-media; fullscreen; picture-in-picture">
  </iframe>
</div>

<script>
  const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);

  if (isMobile) {
    document.body.addEventListener('click', () => {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }
    }, { once: true });
  }
</script>

</body>
</html>
    `);

  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Erro interno');
  }
};
