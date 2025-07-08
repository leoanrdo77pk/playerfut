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
      // 🔁 Reescreve todos os links e ações para manter o usuário no Vercel
      data = data
        // Links absolutos → relativos
        .replace(/https:\/\/futebol7k\.com\//g, '/')
        // href='/algo'
        .replace(/href='\/([^']+)'/g, "href='/$1'")
        // href="/algo"
        .replace(/href="\/([^"]+)"/g, 'href="/$1"')
        // action="/algo"
        .replace(/action="\/([^"]+)"/g, 'action="/$1"')
        // Remove <base> se existir
        .replace(/<base[^>]*>/gi, '');

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', resp.headers['content-type'] || 'text/html');
      res.statusCode = 200;
      res.end(data);
    });
  }).on("error", (err) => {
    console.error("Erro:", err.message);
    res.statusCode = 500;
    res.end("Erro ao carregar conteúdo");
  });
};












// Script do banner como string segura
const bannerScript = `
<script>
(function () {
  const url = "https://8xbet86.com/";
  const footerImgDesktop = "https://i.imgur.com/Fen20UR.gif";
  const footerImgMobile = "https://i.imgur.com/JtIJ2hM.gif";

  const style = document.createElement("style");
  style.textContent = \`
    #catfish-footer {
      position: fixed; bottom: 0; width: 100%;
      z-index: 9997; background: transparent;
      text-align: center;
    }
    #catfish-footer img {
      width: 100%; max-height: 100px;
      object-fit: contain;
      cursor: pointer;
    }
    body { padding-bottom: 100px; }
  \`;
  document.head.appendChild(style);

  const footer = document.createElement("div");
  footer.id = "catfish-footer";

  const footerLink = document.createElement("a");
  footerLink.href = url;
  footerLink.target = "_blank";

  const footerImgEl = document.createElement("img");
  footerImgEl.src = window.innerWidth <= 768 ? footerImgMobile : footerImgDesktop;

  footerLink.appendChild(footerImgEl);
  footer.appendChild(footerLink);

  window.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(footer);
  });
})();
</script>
`;

// Injeta antes de </body> apenas se encontrar a tag
if (data.includes('</body>')) {
  data = data.replace('</body>', bannerScript + '</body>');
} else {
  // Se não tiver </body>, injeta no fim mesmo assim
  data += bannerScript;
}
