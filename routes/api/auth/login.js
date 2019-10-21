const jwt = require('jsonwebtoken');
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
  const secret = req.app.get('jwt-secret');

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
    return new Promise((resolve, reject) => {
      jwt.sign(
        {
          _id: user._id,
          username: user.username,
        },
        secret,
        {
          expiresIn: '7d',
          subject: 'userInfo',
        },
        (err, token) => {
          if (err) return reject(err);
          resolve({ user, token });
        }
      );
    });
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
