const express = require('express');
const request = require('request');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/proxy', (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).send('Parâmetro "url" é obrigatório');
  }

  // Stream direto da URL com headers para enganar o servidor de origem
  request({
    url: targetUrl,
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Referer': 'https://la12hd.com/',
      'Origin': 'https://la12hd.com',
    }
  }).pipe(res);
});

app.listen(PORT, () => {
  console.log(`Proxy rodando em http://localhost:${PORT}`);
});
