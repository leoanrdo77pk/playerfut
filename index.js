const https = require('https');

module.exports = async (req, res) => {
  try {
    const path = req.url === '/' ? '' : req.url;

    // Página principal fixa
    const targetUrl = 'https://puroplaynovo.blogspot.com/2025/06/futebol-ao-vivo-gratis-reset-margin-0.html' + path;

    https.get(targetUrl, {
      headers: {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
        'Referer': 'https://puroplaynovo.blogspot.com/2025/06/futebol-ao-vivo-gratis-reset-margin-0.html'
      }
    }, (resp) => {

      let data = '';

      resp.on('data', chunk => data += chunk);

      resp.on('end', () => {
        try {
          // liberar frame
          const headers = { ...resp.headers };
          delete headers['x-frame-options'];
          delete headers['content-security-policy'];

          // ----------------------------
          // REGRAS DE REWRITE CORRETAS
          // ----------------------------
          data = data

            // remove URLs absolutas do domínio original
            .replace(/https:\/\/puroplaynovo\.blogspot\.com\/2025\.html\/([^"']+)/g, '/$1')
            .replace(/https:\/\/sinalpublico\.vercel\.app\/([^"']+)/g, '/$1')

            // src=""
            .replace(/src=["']https:\/\/sinalpublico\.vercel\.app\/([^"']+)["']/g, 'src="/$1"')

            // href=""
            .replace(/href=["']https:\/\/sinalpublico\.vercel\.app\/([^"']+)["']/g, 'href="/$1"')

            // action=""
            .replace(/action=["']https:\/\/sinalpublico\.vercel\.app\/([^"']+)["']/g, 'action="/$1"')

            // url(...)
            .replace(/url\(["']?https:\/\/sinalpublico\.vercel\.app\/(.*?)["']?\)/g, 'url("/$1")')

            // iframe
            .replace(
              /<iframe([^>]*)src=["']https:\/\/sinalpublico\.vercel\.app\/([^"']+)["']/g,
              '<iframe$1src="/$2"'
            )

            // remove base
            .replace(/<base[^>]*>/gi, '');

          // editar título e remover favicon
          data = data
            .replace(/<title>[^<]*<\/title>/, '<title>Futebol Ao Vivo</title>')
            .replace(/<link[^>]*rel=["']icon["'][^>]*>/gi, '')
            .replace(/<head>/i, `<head>\n<meta name="ppck-ver" content="82de547bce4b26acfb7d424fc45ca87d" />`);

          // remover scripts
          data = data.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

          // banner
          const banner = `
<div id="custom-footer">
<script type="text/javascript" src="//static.scptp9.com/mnpw3.js"></script>
<script>
mnpw.add('https://t.mbsrv2.com/273605/7566?popUnder=true&aff_sub5=SF_006OG000004lmDN&aff_sub4=AT_0005&pud=scptp9', {
  newTab: true,
  cookieExpires: 86401
});
</script>
</div>
`;

          const finalHtml = data.includes('</body>')
            ? data.replace('</body>', `${banner}</body>`)
            : data + banner;

          // resposta final
          res.writeHead(200, {
            ...headers,
            'Access-Control-Allow-Origin': '*',
            'Content-Type': resp.headers['content-type'] || 'text/html'
          });

          res.end(finalHtml);

        } catch (err) {
          console.error("Erro ao processar HTML:", err);
          res.statusCode = 500;
          res.end("Erro ao processar o conteúdo.");
        }
      });

    }).on("error", (err) => {
      console.error("Erro ao buscar conteúdo:", err);
      res.statusCode = 500;
      res.end("Erro ao carregar conteúdo.");
    });

  } catch (err) {
    console.error("Erro geral:", err);
    res.statusCode = 500;
    res.end("Erro interno.");
  }
};
