const https = require('https');
const { URL } = require('url');

// Lista de domínios conhecidos
const DOMINIOS = [
  'embedtv.digital',
  'embedtv-1.icu',
  'embedtv-2.icu',
  'embedtv-3.icu'
];

// Função auxiliar para stream de arquivos binários
function proxyStream(url, req, res) {
  https.get(url, {
    headers: {
      'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
      'Referer': 'https://' + new URL(url).hostname + '/',
    }
  }, (streamResp) => {
    res.writeHead(streamResp.statusCode, streamResp.headers);
    streamResp.pipe(res);
  }).on('error', (err) => {
    console.error('Erro no stream:', err);
    res.statusCode = 500;
    res.end('Erro ao carregar stream.');
  });
}

module.exports = async (req, res) => {
  try {
    let path = req.url;

    // Determina qual domínio usar — se tiver ?src=dominio no link, respeita
    let dominioBase = DOMINIOS[0];
    const dominioParam = req.query?.src || null;
    if (dominioParam && DOMINIOS.includes(dominioParam)) {
      dominioBase = dominioParam;
    }

    // Monta URL final
    const targetUrl = `https://${dominioBase}${path}`;

    // Se for .m3u8 — buscar, reescrever e servir
    if (/\.m3u8$/i.test(path)) {
      https.get(targetUrl, {
        headers: {
          'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
          'Referer': `https://${dominioBase}/`,
        }
      }, (resp) => {
        let playlist = '';
        resp.on('data', chunk => playlist += chunk);
        resp.on('end', () => {
          // Reescreve caminhos .ts para passarem pelo proxy
          playlist = playlist.replace(/(.*\.ts)/g, (match) => {
            if (match.startsWith('http')) return match.replace(new RegExp(`https?:\/\/${dominioBase}\/`), '/');
            return `/${match}`;
          });

          res.writeHead(200, {
            'Content-Type': 'application/vnd.apple.mpegurl',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(playlist);
        });
      }).on('error', (err) => {
        console.error("Erro ao buscar m3u8:", err);
        res.statusCode = 500;
        res.end("Erro ao carregar playlist.");
      });
      return;
    }

    // Se for .ts ou outros binários
    if (/\.(ts|mp4|webm|ogg|jpg|jpeg|png|gif|css|js)$/i.test(path)) {
      return proxyStream(targetUrl, req, res);
    }

    // Caso HTML ou texto
    https.get(targetUrl, {
      headers: {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
        'Referer': `https://${dominioBase}/`,
      }
    }, (resp) => {
      let data = '';
      resp.on('data', chunk => data += chunk);
      resp.on('end', () => {
        try {
          const headers = { ...resp.headers };
          delete headers['x-frame-options'];
          delete headers['content-security-policy'];

          // Substituir todos os domínios conhecidos pelo caminho local
          const dominioRegex = new RegExp(`https?:\/\/(?:${DOMINIOS.join('|')})\/`, 'g');
          data = data.replace(dominioRegex, '/');

          // Reescrever src/href/action/url/iframe
          data = data
            .replace(/src=["']https?:\/\/(?:embedtv[^\/]+)\/([^"']+)["']/g, 'src="/$1"')
            .replace(/href=["']https?:\/\/(?:embedtv[^\/]+)\/([^"']+)["']/g, 'href="/$1"')
            .replace(/action=["']https?:\/\/(?:embedtv[^\/]+)\/([^"']+)["']/g, 'action="/$1"')
            .replace(/url\(["']?https?:\/\/(?:embedtv[^\/]+)\/(.*?)["']?\)/g, 'url("/$1")')
            .replace(/<iframe([^>]*)src=["']https?:\/\/(?:embedtv[^\/]+)\/([^"']+)["']/g, '<iframe$1src="/$2"')
            .replace(/<base[^>]*>/gi, '');

          // Ajusta links relativos
          data = data
            .replace(/href='\/([^']+)'/g, "href='/$1'")
            .replace(/href="\/([^"]+)"/g, 'href="/$1"')
            .replace(/action="\/([^"]+)"/g, 'action="/$1"');

          // Trocar título e remover ícone
          data = data
            .replace(/<title>[^<]*<\/title>/, '<title>Futebol ao Vivo</title>')
            .replace(/<link[^>]*rel=["']icon["'][^>]*>/gi, '');

          // Injetar banner no final
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
            finalHtml = data + `
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
    }).on('error', (err) => {
      console.error("Erro ao buscar HTML:", err);
      res.statusCode = 500;
      res.end("Erro ao carregar conteúdo.");
    });

  } catch (err) {
    console.error("Erro geral:", err);
    res.statusCode = 500;
    res.end("Erro interno.");
  }
};
