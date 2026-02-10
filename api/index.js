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

  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }

  #tapLayer {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0,0,0,0.01);
  }

  #hint {
    position: fixed;
    bottom: 15px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,.7);
    color: #fff;
    font-size: 13px;
    padding: 8px 14px;
    border-radius: 20px;
    z-index: 10000;
  }
</style>
</head>

<body>

<div id="tapLayer"></div>
<div id="hint">Toque para tela cheia</div>

<iframe 
  id="player"
  src="${playerUrl}"
  allowfullscreen
  allow="autoplay; encrypted-media; fullscreen; picture-in-picture">
</iframe>

<script>
  const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);

  function requestFS() {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  }

  if (isMobile) {
    // tentativa automática
    setTimeout(requestFS, 500);

    // fallback no primeiro toque
    document.getElementById('tapLayer').addEventListener('click', () => {
      requestFS();
      document.getElementById('tapLayer').remove();
      document.getElementById('hint').remove();
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
