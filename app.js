const express = require('express');
const morgan = require('morgan');
const connect = require('./models');
const postRouter = require('./router/post_router');
const userRouter = require('./router/user_router');

connect();
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan('tiny'));
app.use('/post', postRouter);
app.use('/users', userRouter);
app.get('/', (req, res) => {
  res.send('Hello');
});
app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
