const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
app.use(cors());

app.get('/proxy', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('URL faltando.');

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
    );
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const content = await page.content();
    await browser.close();

    res.send(content);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao renderizar a página.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy rodando em http://localhost:${PORT}`);
});
