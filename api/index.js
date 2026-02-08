const https = require("https");

const DOMINIOS = [
  "rdcanais.top",
  "streamrdc.xyz",
  "rdcanais.live",
  "rdcanais.vip"
];

// Mapeia o slug para a página real do player
function montarUrl(slug) {
  return `https://rdcanais.top/${slug}`;
}

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(
      url,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Referer": "https://rdcanais.top/",
          "Accept": "text/html"
        }
      },
      (res) => {
        let data = "";

        res.on("data", chunk => data += chunk);
        res.on("end", () => resolve(data));
      }
    ).on("error", reject);
  });
}

module.exports = async (req, res) => {
  try {
    // remove a /
    const slug = req.url.replace("/", "");

    if (!slug) {
      res.status(400).send("Canal não informado");
      return;
    }

    const url = montarUrl(slug);
    let html = await fetchPage(url);

    // 🔥 Corrige TODOS os links internos
    DOMINIOS.forEach(dominio => {
      const rgx = new RegExp(`https?:\/\/${dominio}`, "gi");
      html = html.replace(rgx, "https://playerfut.vercel.app");
    });

    // remove proteções comuns
    html = html
      .replace(/X-Frame-Options/gi, "")
      .replace(/Content-Security-Policy/gi, "");

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");

    res.status(200).send(html);

  } catch (err) {
    res.status(500).send("Erro ao carregar o player");
  }
};
