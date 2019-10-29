const UserModel = require('../../models/user');

module.exports = (socket) => ({ username = '' }, cb) => {
  if (!username) {
    cb({ success: true, users: [] });
    return;
  }

  // 정규식 생성
  const regex = new RegExp(username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  return UserModel.find({ username: regex }, 'username')
    .then((users) => {
      cb({ success: true, users });
    })
    .catch((error) => {
      console.log('Error occurred when user searching! ', error.name, ' : ', error.message);
  
      cb({ success: false, message: error.message });
    });
};
