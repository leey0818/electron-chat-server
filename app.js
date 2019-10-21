const express = require('express');
const morgan = require('morgan');

const config = require('./config');
const port = process.env.PORT || 3000;

const app = express();

// jwt secret key
app.set('jwt-secret', config.secret.key);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('Hello express server!');
});


app.listen(port, () => {
  console.log(`Express is running on port ${port}`);
});
