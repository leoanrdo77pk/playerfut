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
    const contentType = resp.headers['content-type'] || 'text/html';

    resp.on('data', chunk => data += chunk);
    resp.on('end', () => {
      if (contentType.includes('text/html')) {
        // Reescreve os links
        data = data
          .replace(/https:\/\/futebol7k\.com\//g, '/')
          .replace(/href='\/([^']+)'/g, "href='/$1'")
          .replace(/href="\/([^"]+)"/g, 'href="/$1"')
          .replace(/action="\/([^"]+)"/g, 'action="/$1"')
          .replace(/<base[^>]*>/gi, '');

        // Injeta o banner
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

        data = data.replace('</body>', `${bannerScript}</body>`);
      }

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', contentType);
      res.statusCode = 200;
      res.end(data);
    });
  }).on("error", (err) => {
    console.error("Erro ao carregar:", err.message);
    res.statusCode = 500;
    res.end("Erro ao carregar conteúdo");
  });
};
