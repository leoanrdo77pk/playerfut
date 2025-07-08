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

      // Banner simples no topo do body
      const bannerHtml = `
<div id="simple-banner" style="width: 100%; text-align: center; padding: 10px; background: #eee;">
  <a href="https://8xbet86.com/" target="_blank" style="display: inline-block;">
    <img src="https://i.imgur.com/Fen20UR.gif" alt="Banner" style="max-width: 100%; height: auto; cursor: pointer;" />
  </a>
</div>`;

      // Insere banner logo após a tag <body>
      let finalHtml;
      if (data.includes('<body')) {
        finalHtml = data.replace(/<body([^>]*)>/i, match => `${match}\n${bannerHtml}\n`);
      } else {
        // Caso não tenha <body>, adiciona no começo
        finalHtml = bannerHtml + data;
      }

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
