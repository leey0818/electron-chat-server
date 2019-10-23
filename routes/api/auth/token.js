const tokenHelper = require('../../../utils/tokenHelper');
const UserModel = require('../../../models/user');

/*
  사용자 토큰 재발급 API

  POST /api/auth/token
  {
    refreshToken
  }
*/
module.exports = (req, res) => {
  const { refreshToken } = req.body;

  const verifyUser = (decoded) => {
    return UserModel.findOneByUsername(decoded.username)
      .then((user) => {
        if (!user) {
          throw new Error('unauthorized user');
        }

        if (!user.checkRefreshToken(refreshToken)) {
          throw new Error('invalid refresh token');
        }

        return user;
      });
  };

  const createToken = (user) => {
    return tokenHelper.generate(
      {
        _id: user._id,
        username: user.username,
      },
      {
        expiresIn: '1h',
        subject: 'userInfo',
      },
    ).then((token) => Promise.resolve({ user, token }));
  };

  const updateUser = ({ user, token }) => {
    return user.set({
      token,
      UpdatedAt: Date.now(),
    }).save().then(() => Promise.resolve({ token }));
  };

  const respond = ({ token }) => {
    res.json({
      message: 'generated token',
      token,
    });
  };

  const onError = (error) => {
    res.status(401).json({
      message: error.message,
    });
  };

  return tokenHelper.verify(refreshToken)
    .then(verifyUser)
    .then(createToken)
    .then(updateUser)
    .then(respond)
    .catch(onError);
};
