const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';
const jsonTalker = './talker.json';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});

app.get('/talker', (req, res) => {
  try {
    const read = fs.readFileSync(jsonTalker, 'utf8');
    const parseRead = JSON.parse(read);
    res.status(200).json(parseRead);
  } catch (error) {
    res.status(200).json([]);
  }
});

app.get('/talker/:id', (req, res) => {
  const { id } = req.params;
  try {
    const data = fs.readFileSync(jsonTalker, 'utf8');
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
  const randomToken = Math.random().toString(16).substr(2) + Math.random().toString(16).substr(2);
  const token16 = randomToken.substr(1, 16);
  res.send({ token: token16 });
});

const messageNoToken = {
  message: 'Token não encontrado',
};

const messageWrongToken = {
  message: 'Token inválido',
};

const messageNoName = {
  message: 'O campo "name" é obrigatório',
};

const messageShortName = {
  message: 'O "name" deve ter pelo menos 3 caracteres',
};

const messageNoAge = {
  message: 'O campo "age" é obrigatório',
};

const messageMinimalAge = {
  message: 'A pessoa palestrante deve ser maior de idade',
};

const messageWrongDate = {
  message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"',
};

const messageWrongRate = {
  message: 'O campo "rate" deve ser um inteiro de 1 à 5',
};

const messageNoRateOrDate = {
  message: 'O campo "talk" é obrigatório e "watchedAt" e "rate" não podem ser vazios',
};

const validateToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) next(res.status(401).json(messageNoToken));
  if (token.length !== 16) next(res.status(401).json(messageWrongToken));
  next();
};

const validateName = (req, res, next) => {
  const people = req.body;
  const { name } = people;
  if (!name) next(res.status(400).json(messageNoName));
  if (name.length < 3) next(res.status(400).json(messageShortName));
  next();
};

const validateAge = (req, res, next) => {
  const people = req.body;
  const { age } = people;
  if (!age) next(res.status(400).json(messageNoAge));
  if (age < 18) next(res.status(400).json(messageMinimalAge));
  next();
};

const validateTalk = (req, res, next) => {
  const people = req.body;
  const { talk } = people;
  if (!talk || !talk.watchedAt) next(res.status(400).json(messageNoRateOrDate));
  if (talk.rate !== 0 && !talk.rate) next(res.status(400).json(messageNoRateOrDate));
  next();
};

const validateTalkContent = (req, res, next) => {
  const people = req.body;
  const { talk } = people;
  const formatDate = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/i;
  if (!talk.watchedAt.match(formatDate)) next(res.status(400).json(messageWrongDate));
  if (talk.rate < 1 || talk.rate > 5) next(res.status(400).json(messageWrongRate));
  next();
};

app.post('/talker',
  validateToken,
  validateName,
  validateAge,
  validateTalk,
  validateTalkContent,
  (req, res) => {
  const data = fs.readFileSync(jsonTalker, 'utf8');
  const parseData = JSON.parse(data);
  const people = req.body;
  people.id = parseData[parseData.length - 1].id + 1;
  parseData.push(people);
  const stringifyData = JSON.stringify(parseData);
  fs.writeFileSync(jsonTalker, stringifyData);
  res.status(201).json(people);
});

app.put('/talker/:id',
  validateToken,
  validateName,
  validateAge,
  validateTalk,
  validateTalkContent,
  (req, res) => {
    const { id } = req.params;
    const uptPeople = req.body;
    const numId = Number(id);
    const data = fs.readFileSync(jsonTalker, 'utf8');
    const parseData = JSON.parse(data);
    uptPeople.id = numId;
    const deleteLastPeople = parseData.filter((people) => people.id !== numId);
    deleteLastPeople.push(uptPeople);
    const stringifyData = JSON.stringify(deleteLastPeople);
    fs.writeFileSync(jsonTalker, stringifyData);
    res.status(200).json(uptPeople);
  });