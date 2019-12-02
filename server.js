const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const SEGREDO = 'euvoupracasa';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, resp) => {
  resp.send({message:'ok'});
});

app.post('/login', (req, resp) => {
  let body = req.body;
  if (body.username == 'usuario' && body.password == '123456') {
    let token = jwt.sign({ username: 'usuario', role: 'admin' }, SEGREDO, {
      expiresIn: '1h'
    });
    resp.status(200).send({ token });
  } else {
    resp.status(401).send({ message: 'Error in username or password' });
  }
});

function cobrarTokenJWT(req, resp, next) {
  if (req.url == '/login') {
    next();
  }
  let token = req.headers['x-access-token'];
  try {
    jwt.verify(token, SEGREDO, (err, decoded) =>{      
      if (err) {
        return res.json({ message: 'token invalido' });
      } else {
        next();
      }
    });
  } catch (e) {
    resp.status(500).send({ message: 'token invalido' });
  }
}

app.use(cobrarTokenJWT);

let tasks = [];
app.post('/tasks', (request, response) => {
  const body = request.body;
  const task = {
    title: body.title,
    description: body.description,
    isDone: body.isDone,
    isPriority: body.isPriority,
    id: uuid()
  };
  tasks.push(task);
  response.status(201);
  response.send(task);
});

app.get('/tasks', (request, response) => {
  response.status(200).send(tasks);
});

app.get('/tasks/:taskId', (request, response) => {
  const task = tasks.find(t => t.id == request.params.taskId);
  if (task) {
    response.status(200);
    response.send(task);
  } else {
    response.status(404);
    response.send();
  }
});

app.put('/tasks/:taskId', (request, response) => {
  const { title, description, isDone, isPriority } = request.body;
  const task = tasks.find(t => t.id == request.params.taskId);
  if (task) {
    task.title = title;
    task.description = description;
    task.isDone = isDone;
    task.isPriority = isPriority;
    response.status(200).send(task);
  } else {
    response.status(404);
    response.send();
  }
});

app.delete('/tasks/:taskId', (request, response) => {
  let task = tasks.find(t => t.id == request.params.taskId);
  if (task) {
    tasks = tasks.filter(t => t.id != request.params.taskId);
    response.status(200).send(task);
  } else {
    response.status(404).send();
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});