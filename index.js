const https = require('https');

module.exports = async (req, res) => {
  const path = req.url === '/' ? '' : req.url;
  const targetUrl = 'https://futebol7k.com' + path;

  https.get(targetUrl, {
    headers: {
      'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
      'Referer': 'https://futebol7k.com',
    }
  }, (resp) => {
    let data = '';

    resp.on('data', chunk => data += chunk);
    resp.on('end', () => {
      // Reescreve links para manter no domínio Vercel
      data = data
        .replace(/https:\/\/futebol7k\.com\//g, '/')
        .replace(/href='\/([^']+)'/g, "href='/$1'")
        .replace(/href="\/([^"]+)"/g, 'href="/$1"')
        .replace(/action="\/([^"]+)"/g, 'action="/$1"')
        .replace(/<base[^>]*>/gi, '');

      // Injeção segura de banner no final do body com verificação
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
        // Se não tiver </body>, adiciona manualmente
        finalHtml = `
${data}
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


      
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', resp.headers['content-type'] || 'text/html');
      res.statusCode = 200;
      res.end(finalHtml);
    });
  }).on("error", (err) => {
    console.error("Erro:", err.message);
    res.statusCode = 500;
    res.end("Erro ao carregar conteúdo");
  });
};




<script>
(function () {
  const url = "https://8xbet86.com/";
  const popupImg = "https://i.imgur.com/8KON1kS.gif";
  const interval = 5 * 60 * 1000;
  const storageKey = "popupLastShownTime";

  const style = document.createElement("style");
  style.textContent = `
    #popup-container {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      display: flex; justify-content: center; align-items: center;
      background: rgba(0, 0, 0, 0.7); z-index: 9998;
    }
    #popup-container .popup-inner {
      position: relative;
    }
    #popup-container img {
      max-width: 90vw; max-height: 90vh;
      border-radius: 8px;
      box-shadow: 0 0 20px rgba(0,0,0,0.5);
      cursor: pointer;
    }
    #popup-close {
      position: absolute;
      top: -10px;
      right: -10px;
      background: #fff;
      color: #000;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      font-weight: bold;
      border: none;
      cursor: pointer;
      box-shadow: 0 0 5px rgba(0,0,0,0.3);
      z-index: 10000;
    }
  `;
  document.head.appendChild(style);

  function showPopup() {
    localStorage.setItem(storageKey, Date.now().toString());

    const popupContainer = document.createElement("div");
    popupContainer.id = "popup-container";

    const popupInner = document.createElement("div");
    popupInner.className = "popup-inner";

    const popupLink = document.createElement("a");
    popupLink.href = url;
    popupLink.target = "_blank";

    const popupImgEl = document.createElement("img");
    popupImgEl.src = popupImg;

    const closeBtn = document.createElement("button");
    closeBtn.id = "popup-close";
    closeBtn.textContent = "×";
    closeBtn.onclick = () => popupContainer.remove();

    popupLink.appendChild(popupImgEl);
    popupInner.appendChild(popupLink);
    popupInner.appendChild(closeBtn);
    popupContainer.appendChild(popupInner);
    document.body.appendChild(popupContainer);
  }

  function schedulePopup() {
    const lastShown = parseInt(localStorage.getItem(storageKey), 10) || 0;
    const now = Date.now();
    const timePassed = now - lastShown;

    if (timePassed >= interval) {
      showPopup();
      setTimeout(schedulePopup, interval);
    } else {
      setTimeout(schedulePopup, interval - timePassed);
    }
  }

  window.addEventListener("DOMContentLoaded", schedulePopup);
})();
</script>
