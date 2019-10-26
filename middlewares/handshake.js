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

    if (tokenHelper.isTokenExpiredError(error)) {
      next(new Error('expired token'));
    } else if (tokenHelper.isTokenError(error)) {
      next(new Error('invalid token'));
    } else if (error.message === 'invalid token') {
      next(error);
    } else {
      next(new Error('unauthorized user'));
    }
  };

  tokenHelper.verify(token)
    .then(verifyUser)
    .then(setSocketInfo)
    .catch(onError);
};
