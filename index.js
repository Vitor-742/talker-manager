const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});

app.get('/talker', (req, res) => {
  try {
    const data = fs.readFileSync('./talker.json', 'utf8');
    const parseData = JSON.parse(data);
    res.status(200).json(parseData);
  } catch (error) {
    res.status(200).json([]);
  }
});

app.get('/talker/:id', (req, res) => {
  const { id } = req.params;
  try {
    const data = fs.readFileSync('./talker.json', 'utf8');
    const parseData = JSON.parse(data);
    const peopleId = parseData.find((people) => people.id === parseInt(id, 10));
    if (!peopleId) throw new Error();
    res.status(200).json(peopleId);
  } catch (err) {
    res.status(404).json({
      message: 'Pessoa palestrante não encontrada',
    });
  }
});