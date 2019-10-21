const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String ,required: true },
  token: String,

  CreatedAt: { type: Date, default: Date.now },
  UpdatedAt: { type: Date, default: Date.now },
});

/** define static methods */
// 사용자 생성
UserSchema.statics.create = function (username, password) {
  // 비밀번호 암호화
  const encrypt = (salt) => {
    return bcrypt.hash(password, salt);
  };

  // 사용자 저장
  const create = (encPw) => {
    return new this({
      username,
      password: encPw,
    }).save();
  };

  return bcrypt.genSalt(12)
    .then(encrypt)
    .then(create);
};

// 사용자명에 대한 데이터 검색
UserSchema.statics.findOneByUsername = function (username) {
  return this.findOne({ username }).exec();
};


/** define public methods */
// 암호화된 비밀번호 비교
UserSchema.methods.verifyPassword = function (password) {
  return bcrypt.compare(this.password, password);
};

// 토큰값 검증
UserSchema.methods.verifyToken = function (token) {
  return this.token === token;
};


module.exports = mongoose.model('User', UserSchema);