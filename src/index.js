const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  // Complete aqui
  const { username } = request.headers;

  const existentUser = users.find(user => user.username === username)

  if (existentUser === undefined) {
    return response.status(400).json({ error: "User does not exists!" });
  }

  request.user = existentUser;

  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  if (users.some(user => user.username === username)) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user
  const userTodos = user.todos;

  return response.status(200).json(userTodos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { username } = request.headers;
  const { title, deadline } = request.body;
  const user = request.user

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  const userIndex = users.findIndex(user => user.username === username);
  const userTodos = user.todos;

  userTodos.push(todo);
  user.todos = userTodos;
  users[userIndex] = user;

  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const { title, deadline } = request.body;
  const user = request.user

  const userIndex = users.findIndex(user => user.username === username);
  const userTodos = user.todos;
  const todo = userTodos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "ToDo does not exists!" });
  }

  const todoIntex = userTodos.findIndex(todo => todo.id === id);

  todo.deadline = deadline;
  todo.title = title;

  userTodos[todoIntex] = todo;
  user.todos = userTodos;
  users[userIndex] = user;

  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const user = request.user

  const userIndex = users.findIndex(user => user.username === username);
  const userTodos = user.todos;
  const todo = userTodos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "ToDo does not exists!" });
  }

  const todoIntex = userTodos.findIndex(todo => todo.id === id);

  todo.done = true;

  userTodos[todoIntex] = todo;
  user.todos = userTodos;
  users[userIndex] = user;

  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const user = request.user

  const userIndex = users.findIndex(user => user.username === username);

  const todo = user.todos.some(todo => todo.id === id)

  if (!todo) {
    return response.status(404).json({ error: "ToDo does not exists!" });
  }

  const userTodos = user.todos.filter(todo => todo.id !== id)

  user.todos = userTodos;
  users[userIndex] = user;

  return response.status(204).send();
});

module.exports = app;