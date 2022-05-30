const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const authMiddleware = require('../middlewares/auth-middleware');

const postUsersSchema = Joi.object({
  nickname: Joi.string().alphanum().min(3).required(),
  password: Joi.string().min(4).required(),
  confirmPassword: Joi.string().required(),
});

// 회원가입 API
router.post('/', async (req, res) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split('')[1];
    if (token.length) {
      res.status(400).send({
        errorMessage: '이미 로그인이 되어있습니다.',
      });
      return;
    }
  }

  try {
    const { nickname, password, confirmPassword } =
      await postUsersSchema.validateAsync(req.body);
    if (password !== confirmPassword) {
      res.status(400).send({
        errorMessage: '패스워드가 패스워드 확인란과 동일하지 않습니다.',
      });
      return;
    }
    const existUsers = await User.find({ nickname });

    if (existUsers.length) {
      res.status(400).send({
        errorMessage: '중복된 닉네임이 있습니다.',
      });
      return;
    }
    if (password.includes(nickname)) {
      res.status(400).send({
        errorMessage: '비밀번호에 닉네임을 포함시킬 수 없습니다.',
      });
      return;
    }

    const user = new User({ nickname, password });
    await user.save();
    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      errorMessage: '요청한 데이터 형식이 올바르지 않습니다.',
    });
  }
});

// 로그인 API
router.post('/auth', async (req, res) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split('')[1];
    if (token.length) {
      res.status(400).send({
        errorMessage: '이미 로그인이 되어있습니다.',
      });
      return;
    }
  }
  const { nickname, password } = req.body;

  const user = await User.findOne({ nickname, password }).exec();

  if (!user) {
    res.status(400).send({
      errorMessage: '이메일 또는 패스워드가 잘못됐습니다.',
    });
    return;
  }

  const token = jwt.sign({ userId: user.userId }, 'jason');
  res.send({ token });
});

module.exports = router;
