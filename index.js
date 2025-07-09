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
      // Adiciona <base href> para manter o site funcionando com links relativos
      if (!data.includes('<base')) {
        data = data.replace('<head>', `<head><base href="https://futebol7k.com/">`);
      }

      // Script de overlay leve e seguro
      const overlayScript = `
<script>
document.addEventListener("DOMContentLoaded", function () {
  const style = document.createElement("style");
  style.textContent = \`
    #overlay-banner {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      background: rgba(0,0,0,0.7);
      padding: 8px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
    }
    #overlay-banner img {
      max-width: 200px;
      height: auto;
      cursor: pointer;
      border-radius: 5px;
    }
  \`;
  document.head.appendChild(style);

  const div = document.createElement("div");
  div.id = "overlay-banner";
  div.innerHTML = \`
    <a href="https://8xbet86.com/" target="_blank">
      <img src="https://i.imgur.com/Fen20UR.gif" alt="Banner" />
    </a>
  \`;

  document.body.appendChild(div);
});
</script>`;

      // Injeta o script no final da página, sem mexer no resto
      const finalHtml = data.includes('</body>')
        ? data.replace('</body>', overlayScript + '</body>')
        : data + overlayScript;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.statusCode = 200;
      res.end(Buffer.from(finalHtml, 'utf-8'));
    });
  }).on("error", (err) => {
    console.error("Erro:", err.message);
    res.statusCode = 500;
    res.end("Erro ao carregar conteúdo");
  });
};
