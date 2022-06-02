const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const User = require('./models/user.js');
const authMiddleware = require('./middleware/auth.js');

mongoose.connect(
  'mongodb://localhost/shopping-demo-prac',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (error) => {
    if (error) console.log('Mongo DB Connect Error');
    else console.log('Mongo DB connect Success');
  }
);
mongoose.connection.on(
  'error',
  console.error.bind(console, 'connection error:')
);
const app = express();
const router = express.Router();
app.set('port', process.env.PORT || 3000);
app.use(morgan('tiny'));
app.use(express.static('assets'));
app.use('/api', express.urlencoded({ extended: false }), router);

// 회원가입 API
router.post('/users', async (req, res) => {
  const { nickname, email, password, confirmPassword } = req.body;
  const existUser = await User.find({ $or: [{ nickname }, { email }] });
  if (existUser.length) {
    return res
      .status(400)
      .send({ errorMessage: '이미 등록된 닉네임 또는 이메일입니다.' });
  }
  if (password !== confirmPassword) {
    return res
      .status(400)
      .send({ errorMessage: '비밀번호와 비밀번화 확인이 다릅니다.' });
  }

  const user = new User({ nickname, email, password });
  await user.save();
  res.status(200).send({});
});
const secretKey = 'jason';

// 로그인 API
router.post('/auth', async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  console.log(user);
  if (!user) {
    return res
      .status(400)
      .send({ errorMessage: '이메일 혹은 비밀번호를 잘못입력했습니다.' });
  }
  const token = jwt.sign({ userid: user.userId }, secretKey);
  res.status(200).send({ token });
});

// 사용자 인증 API
router.get('/users/me', authMiddleware, (req, res, next) => {
  res.send({});
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기 중');
});
