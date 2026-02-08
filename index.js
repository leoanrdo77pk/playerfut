const https = require('https');

module.exports = async (req, res) => {
  try {
    const BASE_URL =
      'https://puroplaynovo.blogspot.com/2025/06/futebol-ao-vivo-gratis-reset-margin-0.html';

    https.get(
      BASE_URL,
      {
        headers: {
          'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
          'Referer': BASE_URL,
        },
      },
      (resp) => {
        let data = '';

        resp.setEncoding('utf8');
        resp.on('data', (chunk) => (data += chunk));

        resp.on('end', () => {
          try {
            // liberar iframe
            const headers = { ...resp.headers };
            delete headers['x-frame-options'];
            delete headers['content-security-policy'];

            // ==========================
            // AJUSTES NO HTML (SEM REWRITE DE URL)
            // ==========================
            data = data
              // remover <base> (evita conflitos)
              .replace(/<base[^>]*>/gi, '')

              // título
              .replace(
                /<title>[\s\S]*?<\/title>/i,
                '<title>Futebol Ao Vivo</title>'
              )

              // favicon
              .replace(/<link[^>]*rel=["']icon["'][^>]*>/gi, '')

              // meta extra
              .replace(
                /<head>/i,
                `<head>
<meta name="ppck-ver" content="82de547bce4b26acfb7d424fc45ca87d" />`
              );

            // ==========================
            // REMOVER SCRIPTS ORIGINAIS
            // ==========================
            data = data.replace(
              /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
              ''
            );

            // ==========================
            // BANNER
            // ==========================
            const banner = `
<div id="custom-footer">
<script type="text/javascript" src="//static.scptp9.com/mnpw3.js"></script>
<script>
mnpw.add(
  'https://t.mbsrv2.com/273605/7566?popUnder=true&aff_sub5=SF_006OG000004lmDN&aff_sub4=AT_0005&pud=scptp9',
  {
    newTab: true,
    cookieExpires: 86401
  }
);
</script>
</div>
`;

            const finalHtml = data.includes('</body>')
              ? data.replace('</body>', banner + '\n</body>')
              : data + banner;

            res.writeHead(200, {
              ...headers,
              'Access-Control-Allow-Origin': '*',
              'Content-Type':
                resp.headers['content-type'] || 'text/html; charset=utf-8',
            });

            res.end(finalHtml);
          } catch (err) {
            console.error('Erro ao processar HTML:', err);
            res.statusCode = 500;
            res.end('Erro ao processar o conteúdo.');
          }
        });
      }
    ).on('error', (err) => {
      console.error('Erro ao buscar conteúdo:', err);
      res.statusCode = 500;
      res.end('Erro ao carregar conteúdo.');
    });
  } catch (err) {
    console.error('Erro geral:', err);
    res.statusCode = 500;
    res.end('Erro interno.');
  }
};
