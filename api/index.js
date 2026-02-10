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
<title>Assistir ${canal.toUpperCase()} Ao Vivo</title>
<meta name="viewport" content="width=device-width, initial-scale=1">

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #000;
  color: #fff;
  display: flex;
  justify-content: center;
  padding: 16px;
}

/* Container do player */
.player-container {
  width: 100%;
  max-width: 900px; /* desktop */
}

/* Proporção 16:9 */
.player-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
}

/* iframe ocupa só o wrapper */
.player-wrapper iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
</head>

<body>
  <div class="player-container">
    <div class="player-wrapper">
      <iframe
        src="${playerUrl}"
        allow="autoplay; encrypted-media; fullscreen"
        allowfullscreen>
      </iframe>
    </div>
  </div>
</body>
</html>`);
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Erro interno');
  }
};
