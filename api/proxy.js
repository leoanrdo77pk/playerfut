import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL não especificada.' });
  }

  try {
    const targetUrl = decodeURIComponent(url);
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': req.headers['user-agent'] || '',
      }
    });

    const contentType = response.headers.get('content-type');
    res.setHeader('Content-Type', contentType);
    const buffer = await response.buffer();
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar o conteúdo.' });
  }
}
