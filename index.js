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

      // Overlay banner HTML + CSS + JS
      const overlayCode = `
<script>
document.addEventListener('DOMContentLoaded', function () {
  // Cria o overlay
  const overlay = document.createElement('div');
  overlay.id = 'custom-overlay-banner';

  // Conteúdo do banner
  overlay.innerHTML = \`
    <a href="https://8xbet86.com/" target="_blank" style="display:block;">
      <img src="https://i.imgur.com/Fen20UR.gif" alt="Banner" style="max-width: 300px; width: 90vw; cursor: pointer;" />
    </a>
    <button id="close-overlay" aria-label="Fechar banner" title="Fechar" style="
      position: absolute;
      top: 2px;
      right: 2px;
      background: rgba(0,0,0,0.5);
      color: white;
      border: none;
      border-radius: 50%;
      width: 26px;
      height: 26px;
      font-weight: bold;
      cursor: pointer;
      ">×</button>
  \`;

  // Estilo do overlay
  const style = document.createElement('style');
  style.textContent = \`
    #custom-overlay-banner {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(0,0,0,0.6);
      padding: 5px;
      border-radius: 8px;
      z-index: 9999;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      max-width: 320px;
    }
    #custom-overlay-banner img {
      border-radius: 5px;
      display: block;
    }
    #close-overlay:hover {
      background: rgba(0,0,0,0.8);
    }
  \`;
  document.head.appendChild(style);

  // Fecha o overlay ao clicar no botão
  overlay.querySelector('#close-overlay').addEventListener('click', () => {
    overlay.remove();
  });

  document.body.appendChild(overlay);
});
</script>
</body>`;

      // Injeta o overlay antes do fechamento do </body>
      const finalHtml = data.includes('</body>') ? data.replace('</body>', overlayCode) : data + overlayCode;

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
