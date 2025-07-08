const axios = require('axios');

module.exports = async (req, res) => {
  try {
    // Solicita o conteúdo do site externo
    const response = await axios.get('https://futebol7k.com');
    
    // Envia o conteúdo de volta para o navegador
    res.status(200).send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao carregar conteúdo');
  }
};
