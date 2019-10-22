const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * 토큰의 유효성을 검증합니다.
 * @param {string} token jwt token
 */
const verify = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.secret.key, (err, decoded) => {
      if (err) reject(err);
      resolve(decoded);
    });
  });
};

module.exports = {
  verify,
};
