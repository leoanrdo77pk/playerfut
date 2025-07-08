const axios = require('axios');

module.exports = async (req, res) => {
  const url = 'https://futebol7k.com' + req.url;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
        'Referer': 'https://futebol7k.com',
      }
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', response.headers['content-type']);
    res.status(200).send(response.data);
  } catch (err) {
    console.error('Erro ao carregar:', err.message);
    res.status(500).send('Erro ao carregar conteúdo');
  }
};
