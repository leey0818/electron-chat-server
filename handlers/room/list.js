const UserModel = require('../../models/user');

module.exports = (socket) => ({ roomName = '' }, cb) => {
  // 사용자 정보 검색
  const findUser = (username) => {
    return UserModel.findOne({ username }).populate('rooms').then((user) => {
      if (!user) {
        throw new Error('not exist user');
      }

      return user;
    });
  };

  // 방 검색
  const findRooms = (user) => {
    if (roomName) {
      return user.rooms.filter((room) => room.name.includes(roomName));
    }

    return user.rooms;
  };

  const onSuccess = (rooms) => {
    cb({ success: true, rooms });
  };

  const onError = (error) => {
    cb({ success: false, message: error.message });
  };

  return findUser(socket.info.username)
    .then(findRooms)
    .then(onSuccess)
    .catch(onError);
};
