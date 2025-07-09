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
    let data = [];

    resp.on('data', chunk => data.push(chunk));
    resp.on('end', () => {
      const buffer = Buffer.concat(data);
      let html = buffer.toString('utf8');

      // Corrige links quebrados
      html = html
        .replace(/https:\/\/futebol7k\.com\//g, '/')
        .replace(/href='\/([^']+)'/g, "href='/$1'")
        .replace(/href="\/([^"]+)"/g, 'href="/$1"')
        .replace(/action="\/([^"]+)"/g, 'action="/$1"')
        .replace(/<base[^>]*>/gi, '');

      // Injetar overlay (com style e segurança)
      const overlay = `
<script>
document.addEventListener("DOMContentLoaded", function () {
  const div = document.createElement("div");
  div.innerHTML = \`
    <div style="position:fixed; bottom:20px; right:20px; z-index:9999;">
      <a href='https://8xbet86.com/' target='_blank'>
        <img src='https://i.imgur.com/Fen20UR.gif' style='width:180px; border-radius:6px; box-shadow:0 0 10px rgba(0,0,0,0.5);' />
      </a>
    </div>\`;
  document.body.appendChild(div);
});
</script>
</body>`;

      if (html.includes('</body>')) {
        html = html.replace('</body>', overlay);
      }

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.statusCode = 200;
      res.end(html);
    });

  }).on('error', (err) => {
    console.error('Erro:', err.message);
    res.statusCode = 500;
    res.end('Erro ao carregar conteúdo');
  });
};
