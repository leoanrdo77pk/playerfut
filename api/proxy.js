const request = require('request');

module.exports = (req, res) => {
  const targetUrl = decodeURIComponent(req.query.url || '');

  if (!targetUrl.startsWith('http')) {
    res.status(400).send('URL inválida');
    return;
  }

  req.pipe(request(targetUrl)).on('error', (err) => {
    res.status(500).send('Erro no proxy: ' + err.message);
  }).pipe(res);
};
