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

<!-- HISTATS -->
<div id="histats_counter"></div>
<script type="text/javascript">
var _Hasync= _Hasync|| [];
_Hasync.push(['Histats.start', '1,5010958,4,200,270,23,00011101']);
_Hasync.push(['Histats.track_hits', '']);
(function() {
  var hs = document.createElement('script');
  hs.type = 'text/javascript';
  hs.async = true;
  hs.src = ('//s10.histats.com/js15_as.js');
  document.body.appendChild(hs);
})();
</script>
<!-- FIM HISTATS -->

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
