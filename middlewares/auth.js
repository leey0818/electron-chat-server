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
        // 사용자가 없거나, 사용자 토큰이 일치하지 않으면 접근 거부
        if (!user) {
          throw new Error('unauthroized user');
        }

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
    res.status(403).json({
      success: false,
      message: error.message,
    });
  };

  return tokenHelper.verify(token)
    .then(verifyUser)
    .then(setDecoded)
    .catch(onError);
};
