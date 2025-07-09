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
      // Reescreve links para manter no domínio do Vercel
      data = data
        .replace(/https:\/\/futebol7k\.com\//g, '/')
        .replace(/href='\/([^']+)'/g, "href='/$1'")
        .replace(/href="\/([^"]+)"/g, 'href="/$1"')
        .replace(/action="\/([^"]+)"/g, 'action="/$1"')
        .replace(/<base[^>]*>/gi, '');

      // Script seguro para overlay
      const overlayScript = `
<script>
document.addEventListener("DOMContentLoaded", function () {
  const style = document.createElement("style");
  style.textContent = \`
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
  \`;
  document.head.appendChild(style);

  const overlay = document.createElement("div");
  overlay.id = "overlay-banner";
  overlay.innerHTML = \`
    <a href="https://8xbet86.com/" target="_blank">
      <img src="https://i.imgur.com/Fen20UR.gif" alt="Banner" />
    </a>
    <button id="overlay-close" title="Fechar">×</button>
  \`;

  overlay.querySelector('#overlay-close').addEventListener('click', () => {
    overlay.remove();
  });

  document.body.appendChild(overlay);
});
</script>`;

      // Injeta o script no final do body
      const finalHtml = data.includes('</body>')
        ? data.replace('</body>', overlayScript + '</body>')
        : data + overlayScript;

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', resp.headers['content-type'] || 'text/html');
      res.statusCode = 200;
      res.end(finalHtml);
    });
  }).on('error', (err) => {
    console.error('Erro:', err.message);
    res.statusCode = 500;
    res.end('Erro ao carregar conteúdo');
  });
};
