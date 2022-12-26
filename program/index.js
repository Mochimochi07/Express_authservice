const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const secret = 'mysecret';


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const users = {
  'user1': {
    'password': 'password1'
  },
  'user2': {
    'password': 'password2'
  }
};


app.post('/login', (req, res) => {
  const { username, password } = req.body;

  
  if (username in users && users[username].password === password) {
    
    const token = jwt.sign({ username }, secret, { expiresIn: '1h' });
    res.send({ token });
  } else {
    res.status(401).send({ error: 'Invalid username or password' });
  }
});


const authenticate = (req, res, next) => {
  
  const authHeader = req.headers.authorization;
  if (authHeader) {
    
    const token = authHeader.split(' ')[1];
    try {
      
      req.user = jwt.verify(token, secret);
      next();
    } catch (error) {
      res.status(401).send({ error: 'Invalid JWT' });
    }
  } else {
    res.status(401).send({ error: 'No JWT provided' });
  }
};


app.get('/protected', authenticate, (req, res) => {
  res.send({ message: `Welcome, ${req.user.username}` });
});


const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
