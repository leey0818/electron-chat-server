const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * 토큰을 발급합니다.
 * @param {object} payload jwt payload
 * @param {object} [options] jwt 서명 옵션 (sign options)
 */
const generate = (payload, options = {}) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, config.secret.key, options, (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });
};

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

/**
 * 발생한 오류가 JWT 관련 오류인지 확인합니다.
 * @param {Error} error error
 */
const isTokenError = (error) => {
  switch (error && error.name) {
    case 'TokenExpiredError':
    case 'JsonWebTokenError':
    case 'NotBeforeError':
      return true;
    default:
      return false;
  }
};

/**
 * 발생한 오류가 JWT 토큰 만료 오류인지 확인합니다.
 * @param {Error} error error
 */
const isTokenExpiredError = (error) => {
  return (error && error.name === 'TokenExpiredError');
};


module.exports = {
  generate,
  verify,
  isTokenError,
  isTokenExpiredError,
};
