const http = require('http');
const https = require('https');
const { URL } = require('url');

const PORT = 3000;

// Blog tratado como domínio único
const BLOG_DOMINIO = 'puroplaynovo.blogspot.com';
const BLOG_PATH =
  '/2025/06/futebol-ao-vivo-gratis-reset-margin-0.html?m=1';

// Proxy real do player
const PLAYER_PROXY = 'playerfut.vercel.app';

function handleProxy(req, res) {
  let targetUrl;

  // 👉 Player dinâmico
  if (req.url.startsWith('/player/')) {
    const id = req.url.replace('/player/', '');
    targetUrl = `https://${PLAYER_PROXY}/rdcanais.top/${id}`;
  } else {
    // 👉 Página principal do blog
    targetUrl = `https://${BLOG_DOMINIO}${BLOG_PATH}?m=1`;
  }

  const parsed = new URL(targetUrl);

  const options = {
    hostname: parsed.hostname,
    path: parsed.pathname + parsed.search,
    method: 'GET',
    headers: {
      'User-Agent': req.headers['user-agent'] || '',
      'Accept': '*/*',
      'Referer': `https://${BLOG_DOMINIO}/`
    }
  };

  https.request(options, response => {
    let body = '';

    response.on('data', chunk => (body += chunk));

    response.on('end', () => {
      const type = response.headers['content-type'] || '';

      if (type.includes('text/html')) {
        body = body

          // 🔁 Blogspot → proxy local
          .replace(
            /https?:\/\/puroplaynovo\.blogspot\.com\/2025\/06\/futebol-ao-vivo-gratis-reset-margin-0\.html\?m=1/g,
            '/'
          )

          // 🔁 playerfut.vercel.app/rdcanais.top/{id}
          .replace(
            /https?:\/\/playerfut\.vercel\.app\/rdcanais\.top\/([a-zA-Z0-9_-]+)/g,
            '/player/$1'
          )

          // 🔁 rdcanais.top/{id} direto
          .replace(
            /https?:\/\/rdcanais\.top\/([a-zA-Z0-9_-]+)/g,
            '/player/$1'
          )

          // 🔁 href="/espn"
          .replace(
            /href="\/([a-zA-Z0-9_-]+)"/g,
            'href="/player/$1"'
          )

          // 🔁 src="/espn"
          .replace(
            /src="\/([a-zA-Z0-9_-]+)"/g,
            'src="/player/$1"'
          )

          // 🔁 action="/espn"
          .replace(
            /action="\/([a-zA-Z0-9_-]+)"/g,
            'action="/player/$1"'
          );
      }

      res.writeHead(200, {
        'Content-Type': type || 'text/html'
      });
      res.end(body);
    });
  })
  .on('error', err => {
    res.writeHead(500);
    res.end('Erro no proxy: ' + err.message);
  })
  .end();
}

http.createServer(handleProxy).listen(PORT, () => {
  console.log(`🔥 Proxy rodando em http://localhost:${PORT}`);
});
