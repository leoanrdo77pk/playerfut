const https = require('https');

module.exports = async (req, res) => {
  const path = req.url === '/' ? '' : req.url;
  const targetUrl = 'https://futemax.wtf/' + path;

  https.get(targetUrl, {
    headers: {
      'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
      'Referer': 'https://futemax.wtf/',
    }
  }, (resp) => {
    let data = '';

    resp.on('data', chunk => data += chunk);
    resp.on('end', () => {
      // Reescreve links internos para que apontem para o seu domínio (Vercel)
      data = data
        .replace(/https:\/\/futemax\.wtf\//g, '/')   // Substitui o domínio original para o caminho relativo
        .replace(/href='\/([^']+)'/g, "href='/$1'") // Substitui os links href internos
        .replace(/href="\/([^"]+)"/g, 'href="/$1"')  // Substitui os links href internos
        .replace(/action="\/([^"]+)"/g, 'action="/$1"') // Substitui os links action internos
        .replace(/src="\/([^"]+)"/g, 'src="/$1"')  // Corrige o src de imagens e scripts
        .replace(/src='\/([^']+)'/g, "src='/$1'")  // Corrige o src de imagens e scripts
        .replace(/<base[^>]*>/gi, '')  // Remove a tag <base> que pode interferir na navegação

      // Adiciona o banner no final do body, se o </body> existir
      let finalHtml;
      if (data.includes('</body>')) {
        finalHtml = data.replace('</body>', `
  <div id="custom-footer">
    <a href="https://8xbet86.com/" target="_blank">
      <img src="https://i.imgur.com/Fen20UR.gif" style="width:100%;max-height:100px;object-fit:contain;cursor:pointer;" alt="Banner" />
    </a>
  </div>
  <style>
    #custom-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      background: transparent;
      text-align: center;
      z-index: 9999;
    }
    body { padding-bottom: 120px !important; }
  </style>
</body>`);
      } else {
        // Se não encontrar </body>, adiciona no final manualmente
        finalHtml = `
${data}
<div id="custom-footer">
  <a href="https://8xbet86.com/" target="_blank">
    <img src="https://i.imgur.com/Fen20UR.gif" style="width:100%;max-height:100px;object-fit:contain;cursor:pointer;" alt="Banner" />
  </a>
</div>
<style>
  #custom-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: transparent;
    text-align: center;
    z-index: 9999;
  }
  body { padding-bottom: 120px !important; }
</style>`;
      }

      // Configura o header de CORS e tipo de conteúdo
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
