const tokenHelper = require('../../../utils/tokenHelper');
const UserModel = require('../../../models/user');

/*
  사용자 로그인 API

  POST /api/auth/login
  {
    username,
    password
  }
*/
module.exports = (req, res) => {
  const { username, password } = req.body;

  const verify = (user) => {
    if (!user) {
      throw new Error('login failed');
    }

    return user.verifyPassword(password).then((valid) => {
      if (!valid) {
        throw new Error('login failed');
      }

      return user;
    });
  };

  const createAccessToken = (user) => {
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

  const createRefreshToken = ({ user, token }) => {
    return tokenHelper.generate(
      {
        username: user.username,
      },
      {
        expiresIn: '30d',
      },
    ).then((refreshToken) => Promise.resolve({ user, token, refreshToken }));
  };

  const updateUser = ({ user, token, refreshToken }) => {
    return user.set({
      token,
      refreshToken,
      UpdatedAt: Date.now(),
    }).save().then(() => Promise.resolve({ token, refreshToken }));
  };

  const respond = ({ token, refreshToken }) => {
    res.json({
      message: 'login successfully',
      token,
      refreshToken,
    });
  };

  const onError = (error) => {
    res.status(403).json({
      message: error.message,
    });
  };

  return UserModel.findOneByUsername(username)
    .then(verify)
    .then(createAccessToken)
    .then(createRefreshToken)
    .then(updateUser)
    .then(respond)
    .catch(onError);
};
