const UserModel = require('../../models/user');
const RoomModel = require('../../models/room');

module.exports = (socket) => ({ roomName }) => {
  // 방 이름 검증
  if (!roomName) {
    throw new Error('room name is not exist.');
    // TODO 방 이름 글자수 및 문자 검증 예정
  }

  // 방 생성
  const createRoom = (user) => {
    // 방 객체 생성 및 첨여자 추가
    const room = new RoomModel({ name: roomName });
    room.users.push(user._id);

    return room.save().then(() => Promise.resolve({ user, room }));
  };

  // 사용자의 방목록에 추가
  const pushRoomToUser = ({ user, room }) => {
    user.rooms.push(room._id);

    return user.save().then(() => Promise.resolve(room));
  };

  const joinRoom = ({ room }) => {
    socket.join(room._id);
  };


  return UserModel.findOneByUsername(socket.info.username)
    .then(createRoom)
    .then(pushRoomToUser)
    .then(joinRoom);
};
