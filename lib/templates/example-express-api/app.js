const express = require("express");
const morgan = require('morgan');
const port = Number(process.env.PORT) || 8080;


const app = express();

// use request logging middleware
app.use(morgan('dev'));

// use application/json request parsing middleware
app.use(express.json());


// user database
let users = [
  {
    id: 1,
    name: 'node',
  },
];


// Convenient request method to initialize after before/after tests
// Note: must come before `users/:name` (or `initialize` will be processed
// as a user name)
app.get('/users/initialize', function(req, res) {
  console.log('INFO: initializing database');
  users = [
    {
      id: 1,
      name: 'node',
    },
  ];
  res.end();
});


app.get('/users', function(req, res) {
  res.json({ success: true, users: users });
});


app.get('/users/:name', function(req, res) {
  const name = req.params.name;

  const user = users.find(u => u.name === name);
  if (!user) {
    return res.status(404).json({
      success: false,
      reason: `user not found: ${name}`,
    });
  }

  res.json({
    success: true,
    user: user,
  });
});


app.post('/users', function(req, res) {
  const user = req.body;
  console.log(`INFO: add user: ${JSON.stringify(user)}`);

  if (!user || !user.name) {
    console.log(`ERROR: can't create user (missing user name)`);
    return res.status(403).json({
      success: false,
      reason: `can't create user (missing user name)`,
    });
  }

  const existing = users.find(u => u.name === user.name);
  if (existing) {
    console.log(`ERROR: user already exists: ${existing.name}`);
    return res.status(403).json({
      success: false,
      reason: `user already exists: ${existing.name}`,
    })
  }

  users.push(user);
  user.id = users.length;

  res.json({ success: true, user: user })
});


app.put('/users/:name', function(req, res) {
  const name = req.params.name;
  const newName = req.body.name;
  console.log(`INFO: update user: ${name} (rename to: ${newName})`);

  // ensure user being renamed exists
  const user = users.find(u => u.name === name);
  if (!user) {
    console.log(`ERROR: user not found: ${name}`);
    return res.status(404).json({
      success: false,
      reason: `can't rename user; user ${name} not found`,
    });
  }

  // ensure user with the new name doesn't already exist
  const existing = users.find(u => u.name === newName);
  if (existing) {
    console.log(`ERROR: can't rename user, user named ${newName} already exists`);
    return res.status(403).json({
      success: false,
      reason: `can't rename user; user named ${newName} already exists`,
    });
  }

  // ok to rename user
  user.name = newName;
  console.log(`INFO: renamed user; old name: ${name}, new name: ${newName})`);

  res.json({
    success: true,
    user: user,
  });
});


app.delete('/users/:name', function(req, res) {
  const name = req.params.name;

  const user = users.find(u => u.name === name);
  if (!user) {
    return res.status(404).json({
      success: false,
      reason: `can't rename user; user ${name} not found`,
    });
  }

  users = users.filter(u => u.name != name);

  res.json({
    success: true,
    user: user,
  });
});


app.listen(port);
console.log('Listening on port %s', port);
