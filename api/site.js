import fetch from 'node-fetch';

export default async function handler(req, res) {
  const targetUrl = 'https://futebol7k.com';

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': req.headers['user-agent']
      }
    });

    const html = await response.text();

    // Retorna o HTML original, sem X-Frame-Options
    res.setHeader('Content-Type', 'text/html');
    res.removeHeader?.('X-Frame-Options'); // Precaução
    res.send(html);
  } catch (err) {
    res.status(500).send('Erro ao carregar conteúdo: ' + err.message);
  }
}
