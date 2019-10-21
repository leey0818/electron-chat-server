const UserModel = require('../../../models/user');

/*
  사용자 등록 API

  POST /api/auth/register
  {
    username,
    password
  }
*/

module.exports = (req, res) => {
  const { username, password } = req.body;

  const create = (user) => {
    if (user) {
      throw new Error('username exists');
    } else {
      return UserModel.create(username, password);
    }
  };

  const respond = () => {
    res.json({
      message: 'User registered',
    });
  };

  const onError = (error) => {
    res.status(409).json({
      message: error.message,
    });
  };

  return UserModel.findOneByUsername(username)
    .then(create)
    .then(respond)
    .catch(onError);
};
