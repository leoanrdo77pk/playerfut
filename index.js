const https = require('https');

module.exports = async (req, res) => {
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

        try {

          const headers = { ...resp.headers };
          delete headers['x-frame-options'];
          delete headers['content-security-policy'];

          // 🔁 Reescrever URLs
          data = data
            .replace(/https:\/\/futebol7k\.com\//g, '/')
            .replace(/src="https:\/\/futebol7k\.com\/([^"]+)"/g, 'src="/$1"')
            .replace(/src='https:\/\/futebol7k\.com\/([^']+)'/g, "src='/$1'")
            .replace(/href="https:\/\/futebol7k\.com\/([^"]+)"/g, 'href="/$1"')
            .replace(/href='https:\/\/futebol7k\.com\/([^']+)'/g, "href='/$1'")
            .replace(/action="https:\/\/futebol7k\.com\/([^"]+)"/g, 'action="/$1"')
            .replace(/url\(["']?https:\/\/futebol7k\.com\/(.*?)["']?\)/g, 'url("/$1")')
            .replace(/<iframe([^>]*)src=["']https:\/\/futebol7k\.com\/([^"']+)["']/g, '<iframe$1src="/$2"')
            .replace(/<base[^>]*>/gi, '');

          // 🎨 Ajustes visuais
          data = data
            .replace(/<title>[^<]*<\/title>/, '<title>Futebol ao Vivo</title>')
            .replace(/<link[^>]*rel=["']icon["'][^>]*>/gi, '')
            .replace(/<head>/i, `<head>
<meta name="ppck-ver" content="82de547bce4b26acfb7d424fc45ca87d" />`);

          // 🚫 Remover scripts antigos
          data = data.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

          // ==============================
          // 🔥 NOVO ANÚNCIO BIDVERTISER
          // ==============================
          const anuncio = `
<div id="ntv_2103671"></div>
<script type="text/javascript">
(function(d) {
	var params =
	{
		bvwidgetid: "ntv_2103671",
		bvlinksownid: 2103671,
		rows: 1,
		cols: 2,
		textpos: "below",
		imagewidth: 150,
		mobilecols: 2,
		cb: (new Date()).getTime()
	};
	params.bvwidgetid = "ntv_2103671" + params.cb;
	d.getElementById("ntv_2103671").id = params.bvwidgetid;
	var qs = Object.keys(params).reduce(function(a, k){ a.push(k + '=' + encodeURIComponent(params[k])); return a},[]).join(String.fromCharCode(38));
	var s = d.createElement('script'); s.type='text/javascript';s.async=true;
	var p = 'https:' == document.location.protocol ? 'https' : 'http';
	s.src = p + "://cdn.hyperpromote.com/bidvertiser/tags/active/bdvws.js?" + qs;
	d.getElementById(params.bvwidgetid).appendChild(s);
})(document);
</script>
`;

          // 📌 Inserir antes do </body>
          let finalHtml;
          if (data.includes('</body>')) {
            finalHtml = data.replace('</body>', `${anuncio}</body>`);
          } else {
            finalHtml = data + anuncio;
          }

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
