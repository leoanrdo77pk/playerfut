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
      // Reescreve links e ações para manter no domínio do Vercel
      data = data
        .replace(/https:\/\/futebol7k\.com\//g, '/')
        .replace(/href='\/([^']+)'/g, "href='/$1'")
        .replace(/href="\/([^"]+)"/g, 'href="/$1"')
        .replace(/action="\/([^"]+)"/g, 'action="/$1"')
        .replace(/<base[^>]*>/gi, '');

      // Código do footer fixo
      const footerHtml = `
      <div id="custom-footer">
        <a href="https://8xbet86.com/" target="_blank">
          <img src="https://i.imgur.com/Fen20UR.gif" alt="Banner de Anúncio" />
        </a>
      </div>
      <style>
        #custom-footer {
          position: fixed;
          bottom: 0;
          width: 100%;
          z-index: 9999;
          background: transparent;
          text-align: center;
          padding: 10px;
        }
        
        #custom-footer img {
          width: 100%;
          max-height: 100px;
          object-fit: contain;
          cursor: pointer;
        }

        body {
          padding-bottom: 120px;
        }
      </style>
      </body>`;

      // Injeta o footer no final da página
      const finalHtml = data.replace('</body>', footerHtml);

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
