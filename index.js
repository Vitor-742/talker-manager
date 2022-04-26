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

const messageNoEmail = {
  message: 'O campo "email" é obrigatório',
};
const messageWrongEmailForm = {
  message: 'O "email" deve ter o formato "email@email.com"',
};
const messageNoPassword = {
  message: 'O campo "password" é obrigatório',
};
const messageShortPassword = {
  message: 'O "password" deve ter pelo menos 6 caracteres',
};

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const emailRegex = /\S+@\S+\.\S+/;
  if (!email) res.status(400).json(messageNoEmail);
  if (!email.match(emailRegex)) res.status(400).json(messageWrongEmailForm);
  if (!password) res.status(400).json(messageNoPassword);
  if (password.length < 6) res.status(400).json(messageShortPassword);
  const randomToken = Math.random().toString(16).substr(7) + Math.random().toString(16).substr(7);
  res.send({ token: randomToken });
});