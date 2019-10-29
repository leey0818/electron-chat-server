const morgan = require('morgan');
const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const io = require('socket.io')();

const config = require('./config');
const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);

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

// define socket server
app.io = io;
io.attach(server, config.socket);

io.use(require('./middlewares/handshake'));

io.on('connection', (socket) => {
  console.log(`Socket connected! ${socket.info.username} : ${socket.id}`);
  socket.broadcast.emit('user.enter', { message: `user entered! ${socket.id}` });

  // socket event handler
  socket.on('error', (error) => {
    console.log(`Socket Error! cause: ${error}`);
  });
  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected. reason: ${reason}`);
  });

  // message event handler
  socket.on('message.send', (data) => {
    console.log(`socket message received. ${data.message}`);
    socket.broadcast.emit('message,receive', { message: data.message });
  });

  // user event handler
  socket.on('user.search', require('./handlers/user/search')(socket));

  // room event handler
  socket.on('room.list', require('./handlers/room/list')(socket));
  socket.on('room.create', require('./handlers/room/create')(socket));
  // socket.on('room.update', () => {});
  // socket.on('room.remove', () => {});
  // socket.on('room.join', () => {});
  // socket.on('room.leave', () => {});
});


// connect to mongodb server
mongoose.connect(config.mongodb.url, config.mongodb.options)
  .then(() => console.log('Connected to mongodb server.'))
  .catch((e) => console.error(e));


server.listen(port);
server.on('listening', () => console.log(`Server is running on port ${port}`));
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use`);
    return process.exit(1);
  }
  if (error.code === 'EACCES') {
    console.error(`Port ${port} requires elevated privileges`);
    return process.exit(1);
  }

  throw error;
});
