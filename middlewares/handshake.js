const UserModel = require('../models/user');
const tokenHelper = require('../utils/tokenHelper');

module.exports = (socket, next) => {
  const { token } = socket.handshake.query;

  if (!token) {
    console.log('token not received');
    next(new Error('unauthorized user'));
  }

  const verifyUser = ({ username }) => {
    console.log(`token verified! check user. ${username}`);

    return UserModel.findOneByUsername(username)
      .then((user) => {
        if (!user) {
          throw new Error('not exist user');
        }

        // 사용자 토큰 검증
        if (!user.verifyToken(token)) {
          throw new Error('invalid token');
        }

        return user;
      });
  };

  const setSocketInfo = (user) => {
    socket.info = {
      id: user._id.toString(),
      username: user.username,
    };

    console.log(`successfully authorized. ${socket.info.username}`);

    next();
  };

  const onError = (error) => {
    console.log(`${error.name} : ${error.message}`);

    switch (error.name) {
      case 'TokenExpiredError':
        return next(new Error('expired token'));
      case 'JsonWebTokenError':
      case 'NotBeforeError':
        return next(new Error('invalid token'));
      default:
        if (error.message === 'invalid token') {
          return next(error);
        } else {
          return next(new Error('unauthorized user'));
        }
    }
  };

  tokenHelper.verify(token)
    .then(verifyUser)
    .then(setSocketInfo)
    .catch(onError);
};
