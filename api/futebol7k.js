const https = require('https');

module.exports = (req, res) => {
  try {
    const path = req.url === '/' ? '' : req.url;
    const targetUrl = 'https://futebol7k.com' + path;

    https.get(targetUrl, {
      headers: {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
        'Referer': 'https://futebol7k.com/',
      }
    }, (resp) => {

      let data = '';

      resp.on('data', chunk => data += chunk);

      resp.on('end', () => {

        const headers = { ...resp.headers };
        delete headers['x-frame-options'];
        delete headers['content-security-policy'];

        if (headers['content-type']?.includes('text/html')) {

          data = data
            .replace(/https:\/\/futebol7k\.com\//g, '/')
            .replace(/src="https:\/\/futebol7k\.com\/([^"]+)"/g, 'src="/$1"')
            .replace(/href="https:\/\/futebol7k\.com\/([^"]+)"/g, 'href="/$1"')
            .replace(/action="https:\/\/futebol7k\.com\/([^"]+)"/g, 'action="/$1"')
            .replace(/url\(["']?https:\/\/futebol7k\.com\/(.*?)["']?\)/g, 'url("/$1")')
            .replace(/<iframe([^>]*)src=["']https:\/\/futebol7k\.com\/([^"']+)["']/g, '<iframe$1src="/$2"')
            .replace(/<base[^>]*>/gi, '');
        }

        res.writeHead(200, {
          ...headers,
          'Access-Control-Allow-Origin': '*',
          'Content-Type': headers['content-type'] || 'text/html'
        });

        res.end(data);

      });

    }).on("error", () => {
      res.statusCode = 500;
      res.end("Erro ao carregar conteúdo.");
    });

  } catch (err) {
    res.statusCode = 500;
    res.end("Erro interno.");
  }
};
