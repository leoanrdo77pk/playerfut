const express = require('express');
const request = require('request');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/proxy', (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).send('Erro: URL de destino não fornecida.');
  }

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
  };

  request({
    url: targetUrl,
    method: 'GET',
    headers: headers,
    followAllRedirects: true,
  })
    .on('error', (err) => {
      console.error('Erro ao requisitar:', err);
      res.status(500).send('Erro interno no proxy.');
    })
    .pipe(res);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Proxy rodando em http://localhost:${PORT}`);
});
