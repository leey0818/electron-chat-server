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

  const createToken = (user) => {
    return tokenHelper.generate(
      {
        _id: user._id,
        username: user.username,
      },
      {
        expiresIn: '7d',
        subject: 'userInfo',
      },
    ).then((token) => Promise.resolve({ user, token }));
  };

  const updateUser = ({ user, token }) => {
    return user.set({
      token,
      UpdatedAt: Date.now(),
    }).save().then(() => Promise.resolve(token));
  };

  const respond = (token) => {
    res.json({
      message: 'login successfully',
      token,
    });
  };

  const onError = (error) => {
    res.status(403).json({
      message: error.message,
    });
  };

  return UserModel.findOneByUsername(username)
    .then(verify)
    .then(createToken)
    .then(updateUser)
    .then(respond)
    .catch(onError);
};
