const https = require('https');

/**
 * ORIGEM ABSOLUTA E FIXA (Blogspot com ?m=1)
 */
const ORIGEM_FIXA =
  'https://puroplaynovo.blogspot.com/2025/06/futebol-ao-vivo-gratis-reset-margin-0.html?m=1';

/**
 * DOMÍNIOS QUE NUNCA PODEM ABRIR
 */
const DOMINIOS_BLOQUEADOS = [
  'rdcanais.top'
];

function fetchUrl(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

module.exports = async (req, res) => {
  try {
    const targetUrl = req.query.url;

    if (!targetUrl) {
      res.status(400).end('URL não informada');
      return;
    }

    let html = await fetchUrl(targetUrl, {
      'User-Agent': 'Mozilla/5.0',
      Referer: ORIGEM_FIXA
    });

    /* =====================================================
       1️⃣ REMOVE REDIRECIONAMENTOS FORÇADOS
    ===================================================== */

    html = html.replace(
      /window\.location(\.href)?\s*=\s*['"][^'"]+['"]/gi,
      ''
    );

    html = html.replace(
      /location\.replace\s*\(\s*['"][^'"]+['"]\s*\)/gi,
      ''
    );

    html = html.replace(
      /document\.location\s*=\s*['"][^'"]+['"]/gi,
      ''
    );

    /* =====================================================
       2️⃣ REMOVE META REFRESH
    ===================================================== */

    html = html.replace(
      /<meta[^>]+http-equiv=["']refresh["'][^>]*>/gi,
      ''
    );

    /* =====================================================
       3️⃣ BLOQUEIA QUALQUER LINK PARA RDCANAIS
    ===================================================== */

    html = html.replace(
      /https?:\/\/(?:www\.)?rdcanais\.top\/[^"'<>\\s]+/gi,
      ORIGEM_FIXA
    );

    /* =====================================================
       4️⃣ REMOVE IFRAME MALICIOSO
    ===================================================== */

    html = html.replace(
      /<iframe[^>]+src=["']https?:\/\/(?:www\.)?rdcanais\.top\/[^"']+["'][^>]*><\/iframe>/gi,
      ''
    );

    /* =====================================================
       5️⃣ LIMPEZA GERAL
    ===================================================== */

    DOMINIOS_BLOQUEADOS.forEach(dom => {
      const rx = new RegExp(dom, 'gi');
      html = html.replace(rx, '');
    });

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    });

    res.end(html);
  } catch (err) {
    console.error('Erro proxy:', err);
    res.status(500).end('Erro interno');
  }
};
