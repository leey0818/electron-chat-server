const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

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

// api router
app.use('/api', require('./routes/api'));

// connect to mongodb server
mongoose.connect(config.mongodb.url, config.mongodb.options)
  .then(() => console.log('Connected to mongodb server.'))
  .catch((e) => console.error(e));


app.listen(port, () => console.log(`Express is running on port ${port}`));
