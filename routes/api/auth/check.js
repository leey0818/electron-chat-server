/*
  GET /api/auth/check
*/
module.exports = (req, res) => {
  res.json({
    success: true,
    info: req.decoded,
  });
};
