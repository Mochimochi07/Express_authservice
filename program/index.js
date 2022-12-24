const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const secret = 'mysecret';

// Set up body parser to parse request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up an in-memory "database" of users
const users = {
  'user1': {
    'password': 'password1'
  },
  'user2': {
    'password': 'password2'
  }
};

// Set up the login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check the username and password against the "database"
  if (username in users && users[username].password === password) {
    // Create a JWT with a 1-hour expiration time
    const token = jwt.sign({ username }, secret, { expiresIn: '1h' });
    res.send({ token });
  } else {
    res.status(401).send({ error: 'Invalid username or password' });
  }
});

// Set up the auth middleware
const authenticate = (req, res, next) => {
  // Check for the presence of a JWT in the request header
  const authHeader = req.headers.authorization;
  if (authHeader) {
    // Extract the JWT from the header
    const token = authHeader.split(' ')[1];
    try {
      // Verify the JWT and attach the decoded payload to the request object
      req.user = jwt.verify(token, secret);
      next();
    } catch (error) {
      res.status(401).send({ error: 'Invalid JWT' });
    }
  } else {
    res.status(401).send({ error: 'No JWT provided' });
  }
};

// Set up a protected route
app.get('/protected', authenticate, (req, res) => {
  res.send({ message: `Welcome, ${req.user.username}` });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
