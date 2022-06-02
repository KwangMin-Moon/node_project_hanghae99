const jwt = require('jsonwebtoken');
const User = require('../models/user.js');

const secretKey = 'jason';
module.exports = (req, res, next) => {
  const [tokenType, tokenValue] = req.headers.authorization.split(' ');
  if (tokenType !== 'Bearer') {
    return res.status(400).send({ errorMessage: '로그인이 필요합니다.' });
  }
  try {
    const { userId } = jwt.verify(tokenValue, secretKey);
    User.findById(userId)
      .exec()
      .then((user) => {
        res.locals.user = user;
        next();
      });
  } catch (error) {
    return res.status(401).send({
      errorMessage: '로그인 후 사용하세요',
    });
  }
};
