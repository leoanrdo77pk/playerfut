const https = require('https');

module.exports = async (req, res) => {
  const path = req.url === '/' ? '' : req.url;
  const targetUrl = 'https://futebol7k.com' + path;

  https.get(targetUrl, {
    headers: {
      'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
      'Referer': 'https://futebol7k.com',
    }
  }, (resp) => {
    let data = '';

    resp.on('data', chunk => data += chunk);
    resp.on('end', () => {
      // Reescreve links para manter no domínio Vercel
      data = data
        .replace(/https:\/\/futebol7k\.com\//g, '/')
        .replace(/href='\/([^']+)'/g, "href='/$1'")
        .replace(/href="\/([^"]+)"/g, 'href="/$1"')
        .replace(/action="\/([^"]+)"/g, 'action="/$1"')
        .replace(/<base[^>]*>/gi, '');

      // Overlay em cima do conteúdo
      const overlayCode = `
<div id="overlay-banner">
  <a href="https://8xbet86.com/" target="_blank">
    <img src="https://i.imgur.com/Fen20UR.gif" alt="Banner" />
  </a>
  <button id="overlay-close" title="Fechar">×</button>
</div>
<style>
  #overlay-banner {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0,0,0,0.6);
    padding: 8px;
    border-radius: 10px;
    z-index: 9999;
    display: flex;
    align-items: center;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
  }
  #overlay-banner img {
    max-width: 250px;
    height: auto;
    border-radius: 5px;
    cursor: pointer;
  }
  #overlay-close {
    position: absolute;
    top: -10px;
    right: -10px;
    background: #fff;
    color: #000;
    border-radius: 50%;
    width: 25px;
    height: 25px;
    font-weight: bold;
    border: none;
    cursor: pointer;
    box-shadow: 0 0 5px rgba(0,0,0,0.3);
  }
</style>
<script>
  document.addEventListener("DOMContentLoaded", () => {
    const closeBtn = document.getElementById('overlay-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        const banner = document.getElementById('overlay-banner');
        if (banner) banner.remove();
      });
    }
  });
</script>
</body>`;

      // Injeta o overlay antes da tag </body>
      const finalHtml = data.includes('</body>')
        ? data.replace('</body>', overlayCode)
        : data + overlayCode;

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', resp.headers['content-type'] || 'text/html');
      res.statusCode = 200;
      res.end(finalHtml);
    });
  }).on("error", (err) => {
    console.error("Erro:", err.message);
    res.statusCode = 500;
    res.end("Erro ao carregar conteúdo");
  });
};
