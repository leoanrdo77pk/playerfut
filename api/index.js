module.exports = (req, res) => {
  try {
    let path = req.url.split('?')[0];
    path = path.replace(/^\/+/, '').toLowerCase();

    if (!path || path === 'favicon.ico') {
      res.statusCode = 404;
      return res.end('Canal não informado');
    }

    // monta URL do player
    const targetUrl = `https://sinalpublico.vercel.app/play/dtv.html?id=${encodeURIComponent(path)}`;

    // redirecionamento direto (mais rápido e estável)
    res.writeHead(302, {
      Location: targetUrl,
      'Cache-Control': 'no-store'
    });
    res.end();

  } catch (err) {
    console.error('Erro:', err);
    res.statusCode = 500;
    res.end('Erro interno');
  }
};
