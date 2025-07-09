const axios = require('axios');

module.exports = async (req, res) => {
  const path = req.url === '/' ? '' : req.url;
  const targetUrl = 'https://futebol7k.com' + path;

  try {
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
        'Referer': 'https://futebol7k.com'
      },
      responseType: 'text',
      decompress: true // trata gzip e deflate
    });

    let html = response.data;

    // Reescreve links para manter no domínio Vercel
    html = html
      .replace(/https:\/\/futebol7k\.com\//g, '/')
      .replace(/href='\/([^']+)'/g, "href='/$1'")
      .replace(/href="\/([^"]+)"/g, 'href="/$1"')
      .replace(/action="\/([^"]+)"/g, 'action="/$1"')
      .replace(/<base[^>]*>/gi, '');

    // Injetar overlay simples no final do body
    const overlayScript = `
<script>
document.addEventListener("DOMContentLoaded", function () {
  const overlay = document.createElement("div");
  overlay.innerHTML = \`
    <div style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;">
      <a href="https://8xbet86.com/" target="_blank">
        <img src="https://i.imgur.com/Fen20UR.gif" style="width: 200px; border-radius: 8px; box-shadow: 0 0 12px rgba(0,0,0,0.5);">
      </a>
    </div>\`;
  document.body.appendChild(overlay);
});
</script>
</body>`;

    if (html.includes('</body>')) {
      html = html.replace('</body>', overlayScript);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);

  } catch (err) {
    console.error('Erro ao buscar conteúdo:', err.message);
    res.status(500).send('Erro ao carregar conteúdo');
  }
};
