const express = require("express");
const request = require("request");
const app = express();

app.use("/", (req, res) => {
  const url = "https://futebol7k.com" + req.url;

  request(
    {
      url,
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    },
    (error, response, body) => {
      if (error) return res.status(500).send("Erro ao carregar conteúdo");

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.removeHeader("X-Frame-Options");
      res.removeHeader("Content-Security-Policy");
      res.send(body);
    }
  );
});

module.exports = app;
