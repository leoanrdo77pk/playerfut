 const https = require('https');

const DOMINIOS = [
  'embedtv.digital',
  'embedtv-5.icu',
  'embedtv-6.icu',
  'embedtv-7.icu',
];

function fetchUrl(url, reqHeaders) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: reqHeaders }, (res) => {
      if (res.statusCode === 200) {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ res, data }));
      } else {
        // Não é 200, rejeita para tentar próximo domínio
        res.resume(); // descarta dados
        reject(new Error('Status ' + res.statusCode));
      }
    }).on('error', reject);
  });
}

module.exports = async (req, res) => {
  try {
    let path = req.url === '/' ? '' : req.url;

    const reqHeaders = {
      'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
      'Referer': `https://${DOMINIOS[0]}/`,
    };

    let fetched = null;
    let dominioUsado = null;

    // Tenta todos os domínios até achar o conteúdo
    for (const dominio of DOMINIOS) {
      try {
        const url = `https://${dominio}${path}`;
        fetched = await fetchUrl(url, reqHeaders);
        dominioUsado = dominio;
        break; // achou, sai do loop
      } catch (_) {
        // continua tentando próximo domínio
      }
    }

    if (!fetched) {
      res.statusCode = 404;
      return res.end('Conteúdo não encontrado em nenhum domínio.');
    }

    const { res: respOrig, data } = fetched;

    // Se for m3u8, reescreve os caminhos dos .ts para passarem pelo proxy
    if (/\.m3u8$/i.test(path)) {
      let playlist = data.replace(/(.*\.ts)/g, (match) => {
        if (match.startsWith('http')) {
          // troca domínio para relativo ao proxy
          return match.replace(new RegExp(`https?:\/\/${dominioUsado}\/`), '/');
        }
        return `/${match}`;
      });
      res.writeHead(200, {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(playlist);
    }

    // Se for arquivo estático (ts, mp4, imagens, css, js), faz proxy direto (stream)
   // Proxy para arquivos estáticos (corrigido para imagens e assets)
if (/\.(ts|mp4|webm|ogg|jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/i.test(path)) {
  const fileUrl = `https://${dominioUsado}${path.startsWith('/') ? path : '/' + path}`;

  https.get(fileUrl, { headers: reqHeaders }, (streamResp) => {
    res.writeHead(streamResp.statusCode, streamResp.headers);
    streamResp.pipe(res);
  }).on('error', (err) => {
    console.error('Erro proxy estático:', err);
    res.statusCode = 500;
    res.end('Erro ao carregar assets.');
  });

  return;
}


    // Se for HTML, reescreve links para manter no seu domínio
    if (respOrig.headers['content-type'] && respOrig.headers['content-type'].includes('text/html')) {
      let html = data;

      // Remove headers que bloqueiam iframe, CSP, etc.
      const headers = { ...respOrig.headers };
      delete headers['x-frame-options'];
      delete headers['content-security-policy'];

      // Reescreve os links dos domínios para relativos
      const dominioRegex = new RegExp(`https?:\/\/(?:${DOMINIOS.join('|')})\/`, 'g');
      html = html.replace(dominioRegex, '/');

      html = html
        .replace(/src=["']https?:\/\/(?:embedtv[^\/]+)\/([^"']+)["']/g, 'src="/$1"')
        .replace(/href=["']https?:\/\/(?:embedtv[^\/]+)\/([^"']+)["']/g, 'href="/$1"')
        .replace(/action=["']https?:\/\/(?:embedtv[^\/]+)\/([^"']+)["']/g, 'action="/$1"')
        .replace(/url\(["']?https?:\/\/(?:embedtv[^\/]+)\/(.*?)["']?\)/g, 'url("/$1")')
        .replace(/<iframe([^>]*)src=["']https?:\/\/(?:embedtv[^\/]+)\/([^"']+)["']/g, '<iframe$1src="/$2"')
        .replace(/<base[^>]*>/gi, '');

      // Ajustes de links relativos
      html = html
        .replace(/href='\/([^']+)'/g, "href='/$1'")
        .replace(/href="\/([^"]+)"/g, 'href="/$1"')
        .replace(/action="\/([^"]+)"/g, 'action="/$1"');

      // Trocar título e remover ícone
      html = html
        .replace(/<title>[^<]*<\/title>/, '<title>Futebol ao Vivo</title>')
        .replace(/<link[^>]*rel=["']icon["'][^>]*>/gi, '');

      // Injetar banner no fim
      if (html.includes('</body>')) {
        html = html.replace('</body>', `
<div id="custom-footer">
<a href="https://t.crjmpx.com/273605/7826?bo=2753,2754,2755,2756&popUnder=true&aff_sub5=SF_006OG000004lmDN&aff_sub4=AT_0002" target="_blank"><img src="https://www.imglnkx.com/10205/DAT-459_DESIGN-24941_sexmessenger_reproduction-banner3_nsfw_300100.gif" width="300" height="100" border="0" /></a>
<script src="https://crxcr1.com/popin/latest/popin-min.js"></script>
<script>
var crakPopInParamsIframe = {
  url: 'https://t.mbsrv2.com/273605/10163/optimized?aff_sub5=SF_006OG000004lmDN&aff_sub4=AT_0016&aff_id=1&transaction_id=postitial',
  decryptUrl: false,
  contentUrl: 'https://t.mbsrv2.com/273605/10163/optimized?aff_sub5=SF_006OG000004lmDN&aff_sub4=AT_0016&aff_id=1&transaction_id=postitial',
  decryptContentUrl: false,
  contentType: 'iframe',
  width: '85%',
  height: '85%',
  timeout: false,
  delayClose: 0,
  clickStart: false,
  closeIntent: false,
  postitialBehavior: true,
  closeButtonColor: '#000',
  closeCrossColor: '#fff',
  shadow: true,
  shadowColor: '#000',
  shadowOpacity: '.5',
  shadeColor: '#111',
  shadeOpacity: '0',
  border: '1px',
  borderColor: '#000',
  borderRadius: '0px',
  leadOut: true,
  animation: 'slide',
  direction: 'up',
  verticalPosition: 'center',
  horizontalPosition: 'center',
  expireDays: 0.01
};
</script>
<a href="https://t.acrsmartcam.com/273605/3484?bo=2779,2778,2777,2776,2775&popUnder=true&aff_sub5=SF_006OG000004lmDN&aff_sub4=AT_0002" target="_blank"><img src="https://www.imglnkx.com/2086/002577A_ILIV_18_ALL_EN_55_L.gif" width="305" height="99" border="0" /></a>

  <script defer src=https://crxcr1.com/cams-widget-ext/im_jerky?lang=en&mode=prerecorded&outlinkUrl=https://t.mbsrv2.com/273605/7020?bo=2753%2C2754%2C2755%2C2756&popUnder=true&aff_sub5=SF_006OG000004lmDN&aff_sub4=AT_0018></script>
</div>
<style>
  #custom-footer {
    position: fixed;
    bottom: 0; left: 0; width: 100%;
    background: transparent;
    text-align: center;
    z-index: 9999;
  }
  body { padding-bottom: 120px !important; }
</style>
</body>`);
      } else {
        html += `
<div id="custom-footer">
<a href="https://t.crjmpx.com/273605/7826?bo=2753,2754,2755,2756&popUnder=true&aff_sub5=SF_006OG000004lmDN&aff_sub4=AT_0002" target="_blank"><img src="https://www.imglnkx.com/10205/DAT-459_DESIGN-24941_sexmessenger_reproduction-banner3_nsfw_300100.gif" width="300" height="100" border="0" /></a>
<script type="text/javascript" src="//static.scptp9.com/mnpw3.js"></script>
<script>mnpw.add('https://t.crjmpx.com/273605/7826?bo=2753,2C2754,2C2755,2C2756&popUnder=true&aff_sub5=SF_006OG000004lmDN&aff_sub4=AT_0005&pud=scptp9', {newTab: true, cookieExpires: 86401});</script>


<a href="https://t.acrsmartcam.com/273605/3484?bo=2779,2778,2777,2776,2775&popUnder=true&aff_sub5=SF_006OG000004lmDN&aff_sub4=AT_0002" target="_blank"><img src="https://www.imglnkx.com/2086/002577A_ILIV_18_ALL_EN_55_L.gif" width="305" height="99" border="0" /></a>

  <script defer src=https://crxcr1.com/cams-widget-ext/im_jerky?lang=en&mode=prerecorded&outlinkUrl=https://t.mbsrv2.com/273605/7020?bo=2753%2C2754%2C2755%2C2756&popUnder=true&aff_sub5=SF_006OG000004lmDN&aff_sub4=AT_0018></script>
</div>
<style>
  #custom-footer {
    position: fixed;
    bottom: 0; left: 0; width: 100%;
    background: transparent;
    text-align: center;
    z-index: 9999;
  }
  body { padding-bottom: 120px !important; }
</style>`;
      }

      res.writeHead(200, {
        ...headers,
        'Access-Control-Allow-Origin': '*',
        'Content-Type': respOrig.headers['content-type'] || 'text/html'
      });
      return res.end(html);
    }

    // Para outros tipos, só repassa puro
    res.writeHead(respOrig.statusCode, respOrig.headers);
    res.end(data);

  } catch (err) {
    console.error('Erro geral proxy:', err);
    res.statusCode = 500;
    res.end('Erro interno.');
  }
};

