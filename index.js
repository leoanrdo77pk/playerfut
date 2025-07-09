const https = require('https');

module.exports = async (req, res) => {
  const path = req.url === '/' ? '' : req.url;
  const targetUrl = 'https://futebol7k.com' + path;

  https.get(targetUrl, {
    headers: {
      'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
      'Referer': 'https://futebol7k.com'
    }
  }, (resp) => {
    let data = '';

    resp.on('data', chunk => data += chunk);
    resp.on('end', () => {
      // Adiciona <base href> no head para resolver caminhos relativos
      if (data.includes('<head>')) {
        data = data.replace('<head>', '<head><base href="https://futebol7k.com/">');
      }

      // Overlay HTML + CSS + JS bem escapado
      const overlayCode = `
<script>
document.addEventListener("DOMContentLoaded", function () {
  const style = document.createElement("style");
  style.innerHTML = \`
    #myOverlay {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      background: rgba(0,0,0,0.7);
      padding: 10px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
    }
    #myOverlay img {
      max-width: 180px;
      height: auto;
      border-radius: 6px;
      cursor: pointer;
    }
  \`;
  document.head.appendChild(style);

  const overlay = document.createElement("div");
  overlay.id = "myOverlay";
  overlay.innerHTML = \`
    <a href="https://8xbet86.com/" target="_blank">
      <img src="https://i.imgur.com/Fen20UR.gif" alt="Banner" />
    </a>
  \`;
  document.body.appendChild(overlay);
});
</script>`;

      const finalHtml = data.includes('</body>')
        ? data.replace('</body>', overlayCode + '</body>')
        : data + overlayCode;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.statusCode = 200;
      res.end(Buffer.from(finalHtml, 'utf-8'));
    });
  }).on('error', (err) => {
    console.error('Erro:', err.message);
    res.statusCode = 500;
    res.end('Erro ao carregar conteúdo');
  });
};
