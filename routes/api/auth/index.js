const router = require('express').Router();
const authMiddleware = require('../../../middlewares/auth');

router.post('/login', require('./login'));
router.post('/register', require('./register'));
router.post('/token', require('./token'));

router.use('/check', authMiddleware);
router.get('/check', require('./check'));

module.exports = router;
