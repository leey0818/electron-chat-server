const tokenHelper = require('../utils/tokenHelper');
const UserModel = require('../models/user');

module.exports = (req, res, next) => {
  const token = req.headers['x-access-token'] || req.query.token;

  if (!token) {
    return res.status(403).json({
      success: false,
      message: 'not logged in',
    });
  }

  const verifyUser = (decoded) => {
    return UserModel.findOneByUsername(decoded.username)
      .then((user) => {
        // 사용자 토큰이 일치하지 않으면 접근 거부
        if (!user.verifyToken(token)) {
          throw new Error('invalid token');
        }

        return decoded;
      });
  };

  const setDecoded = (decoded) => {
    req.decoded = decoded;
    next();
  };

  const onError = (error) => {
    let message;

    switch (error.name) {
      case 'TokenExpiredError':
        message = 'expired token';
        break;
      case 'JsonWebTokenError':
      case 'NotBeforeError':
        message = 'invalid token';
        break;
      default:
        message = error.message;
    }

    res.status(401).json({
      success: false,
      message
    });
  };

  return tokenHelper.verify(token)
    .then(verifyUser)
    .then(setDecoded)
    .catch(onError);
};
