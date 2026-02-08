const https = require('https');

const ORIGEM = {
  dominio: 'puroplaynovo.blogspot.com',
  path: '/2025/06/futebol-ao-vivo-gratis-reset-margin-0.html?m=1'
};

const DOMINIOS_BLOQUEADOS = [
  'rdcanais.top'
];

function fetchHtml(url, headers) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => resolve({ res, data }));
    }).on('error', reject);
  });
}

module.exports = async (req, res) => {
  try {
    const targetUrl = `https://${ORIGEM.dominio}${ORIGEM.path}`;

    const { res: origemRes, data } = await fetchHtml(targetUrl, {
      'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
      Referer: targetUrl
    });

    let html = data;

    /* ===============================
       1️⃣ REWRITE DO BLOGSPOT
    =============================== */

    const blogRegex = new RegExp(
      `https?:\/\/${ORIGEM.dominio}\/2025\/06\/futebol-ao-vivo-gratis-reset-margin-0.html\\?m=1`,
      'gi'
    );

    html = html.replace(blogRegex, '/');

    html = html
      .replace(/href=["']https?:\/\/puroplaynovo\.blogspot\.com\/[^"']+["']/gi, 'href="/"')
      .replace(/src=["']https?:\/\/puroplaynovo\.blogspot\.com\/[^"']+["']/gi, 'src="/"');

    /* ===============================
       2️⃣ BLOQUEIO TOTAL RDCANAIS
    =============================== */

    DOMINIOS_BLOQUEADOS.forEach(dom => {
      const rx = new RegExp(`https?:\/\/${dom}\/[^"'\\s>]+`, 'gi');
      html = html.replace(rx, '/');
    });

    /* remove scripts de redirect */
    html = html.replace(
      /(window|document)\.location(\.href)?\s*=\s*['"][^'"]+['"]/gi,
      ''
    );

    html = html.replace(
      /location\.replace\s*\(\s*['"][^'"]+['"]\s*\)/gi,
      ''
    );

    /* remove meta refresh */
    html = html.replace(
      /<meta[^>]+http-equiv=["']refresh["'][^>]*>/gi,
      ''
    );

    /* ===============================
       3️⃣ ESPAÇO PARA BIDVERTISER
    =============================== */

    const banner = `
<!-- BIDVERTISER AQUI -->
<div id="bidvertiser-banner"></div>
`;

    if (html.includes('</body>')) {
      html = html.replace('</body>', `${banner}</body>`);
    }

    /* ===============================
       4️⃣ HEADERS LIMPOS
    =============================== */

    const headers = { ...origemRes.headers };
    delete headers['x-frame-options'];
    delete headers['content-security-policy'];

    res.writeHead(200, {
      ...headers,
      'Content-Type': 'text/html; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    });

    res.end(html);
  } catch (err) {
    console.error('Erro proxy:', err);
    res.status(500).end('Erro interno');
  }
};
