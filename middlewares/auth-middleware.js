const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization === undefined) {
    res.status(401).send({
      errorMessage: '로그인이 필요한 기능입니다',
    });
    return;
  }
  const [tokenType, tokenValue] = authorization.split(' ');
  console.log(tokenValue);

  if (tokenType !== 'Bearer') {
    res.status(401).send({
      errorMessage: '로그인 후 사용하세요',
    });
    return;
  }
  try {
    const { userId } = jwt.verify(tokenValue, 'jason');
    User.findById(userId)
      .exec()
      .then((user) => {
        res.locals.user = user;
        next();
      });
  } catch (error) {
    res.status(401).send({
      errorMessage: '로그인 후 사용하세요',
    });
    return;
  }
};
