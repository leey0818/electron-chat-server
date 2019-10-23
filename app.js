const morgan = require('morgan');
const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const io = require('socket.io')();

const app = express();
const server = http.createServer(app);

const UserModel = require('./models/user');
const tokenHelper = require('./utils/tokenHelper');
const config = require('./config');
const port = process.env.PORT || 3000;

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

io.use((socket, next) => {
  const { token } = socket.handshake.query;

  if (token) {
    tokenHelper.verify(token)
      .then((decoded) => {
        console.log(`token verified! check valid user... ${decoded.username}`);

        // 사용자 인증
        return UserModel.findOneByUsername(decoded.username)
          .then((user) => {
            if (!user) {
              throw new Error('not exist user');
            }

            if (!user.verifyToken(token)) {
              throw new Error('invalid token');
            }

            return user;
          });
        })
        .then((user) => {
          socket.info = {
            id: user._id,
            username: user.username,
          };

          console.log(`successfully authorized. ${socket.info.username}`);

          next();
        })
        .catch((err) => {
          console.log(`${err.name} : ${err.message}`);

          switch (err.name) {
            case 'TokenExpiredError':
              return next(new Error('expired token'));
            case 'JsonWebTokenError':
            case 'NotBeforeError':
              return next(new Error('invalid token'));
            default:
              return next(new Error('unauthorized user'));
          }
        });
  } else {
    console.log('token not received');
    next(new Error('unauthorized user'));
  }
});

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

  // user event handler
  socket.on('message.send', (data) => {
    console.log(`socket message received. ${data.message}`);
    socket.broadcast.emit('message,receive', { message: data.message });
  });
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
