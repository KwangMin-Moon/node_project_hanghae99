const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/user');
const authMiddleware = require('../middlewares/auth-middleware');
const res = require('express/lib/response');
const { updateOne } = require('../models/post');

// 모든 게시글 데이터를 반환하는 함수
router.get('/', async (req, res) => {
  try {
    let jsonData = await Post.find().sort({ createdAt: -1 });
    for (let x in jsonData) {
      const createdAt = new Date(jsonData[x]['createdAt']);
      const create_date = `${createdAt.getFullYear()}-${
        createdAt.getMonth() + 1
      }-${createdAt.getDate()} ${createdAt.getHours()}:${createdAt.getMinutes()}:${createdAt.getSeconds()}`;
      jsonData[x]['createdAt'] = create_date;
    }
    res.send({ result: jsonData });
  } catch (error) {
    console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
    res.status(400).send();
  }
});

// 게시글 및 댓글 조회
router.get('/:_id', async (req, res) => {
  try {
    const { _id } = req.params;
    const postData = await Post.find({ _id });
    const CommentData = await Comment.find({ postId: _id }).sort({
      createdAt: -1,
    });
    console.log(postData);
    console.log(CommentData);
    res.send({
      result: postData.map((post) => {
        return {
          title: post.title,
          content: post.content,
          comment: CommentData.filter(
            (comment) => comment.postId === post.userId
          ).map((comment) => {
            return {
              comment: comment.comment,
            };
          }),
        };
      }),
    });
  } catch (error) {
    console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
    res.status(400).send();
  }
});

//개시글 생성
router.post('/', authMiddleware, async (req, res) => {
  const { user } = res.locals;
  try {
    const { title, content } = req.body;

    await Post.create({ title, content, userInfo: user._id });
    res.send({ result: '게시글을 생성하였습니다.' });
  } catch (error) {
    console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
    res.status(400).send();
  }
});

// 댓글 생성
router.post('/:_id/comment', authMiddleware, async (req, res) => {
  const { user } = res.locals;
  const { _id } = req.params;
  try {
    const { comment, commentNum } = req.body;
    await Comment.create({
      comment,
      commentNum,
      postId: _id,
      userInfo: user._id,
    });
    res.send({ result: '댓글을 생성하였습니다.' });
  } catch (error) {
    console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
    res.status(400).send();
  }
});

// 게시글 수정
router.put('/:_id', authMiddleware, async (req, res) => {
  const { user } = res.locals; // 자기가 작성한 글만 수정할 수 있게 토큰에 맞는 user을 가지고 옴
  const { _id } = req.params;
  const { content } = req.body;
  try {
    const [isLogin] = await Post.find({ userInfo: user._id });
    console.log(isLogin);

    console.log(user._id);
    console.log(isLogin.userInfo);
    if (isLogin && isLogin.userId === _id) {
      await Post.updateOne({ _id }, { $set: { content } });
      res.send({ result: '게시글을 수정하였습니다.' });
    } else {
      res
        .status(400)
        .send({ errorMessage: '본인이 작성한 글만 수정할 수 있습니다.' });
    }
  } catch (error) {
    return res
      .status(400)
      .send({ errorMessage: '본인이 작성한 글만 수정할 수 있습니다.' });
  }
});

// 댓글 수정
router.put('/:_id/comment', authMiddleware, async (req, res) => {
  const { user } = res.locals;
  const { _id } = req.params;
  const { comment, commentNum } = req.body;
  try {
    const isLogin = await Comment.find({ userInfo: user._id });
    const findComment = isLogin.find((post) => post.postId === _id).postId;
    console.log(isLogin);
    console.log(findComment);

    if (isLogin && findComment) {
      await Comment.updateOne(
        { postId: _id, commentNum },
        { $set: { comment } }
      );
      res.send({ result: '댓글을 수정하였습니다.' });
    } else {
      res
        .status(400)
        .send({ errorMessage: '본인의 댓글만 수정할 수 있습니다.' });
    }
  } catch (error) {
    return res
      .status(400)
      .send({ errorMessage: '본인이 작성한 댓글만 수정할 수 있습니다.' });
  }
});

// 게시글 삭제
router.delete('/:_id', authMiddleware, async (req, res) => {
  const { user } = res.locals; // 자기가 작성한 글만 수정할 수 있게 토큰에 맞는 user을 가지고 옴
  const { _id } = req.params;
  try {
    const [isLogin] = await Post.find({ userInfo: user._id });
    console.log(isLogin);
    console.log(user._id);
    console.log(_id);
    console.log(isLogin.userId);
    if (isLogin && isLogin.userId === _id) {
      await Post.deleteOne({ _id });
      await Comment.deleteMany({ postId: _id }); // 게시글이 삭제되면 거기에 해당하는 댓글도 삭제
      res.send({ result: '게시글을 삭제했습니다.' });
    } else {
      res
        .status(400)
        .send({ errorMessage: '본인이 작성한 글만 삭제 할 수 있습니다.' });
    }
  } catch (error) {
    return res
      .status(400)
      .send({ errorMessage: '본인나 작성한 글만 삭제할 수 있습니다.' });
  }
});

// 댓글 삭제
router.delete('/:_id/comment', authMiddleware, async (req, res) => {
  const { user } = res.locals;
  const { _id } = req.params;
  const { commentNum } = req.body;
  try {
    const isLogin = await Comment.find({ userInfo: user._id });

    const findComment = isLogin.find((post) => post.postId === _id).postId;
    if (isLogin && findComment) {
      await Comment.deleteOne({ postId: _id, commentNum });
      res.send({ result: '댓글을 삭제하였습니다.' });
    } else {
      res
        .status(400)
        .send({ errorMessage: '본인의 댓글만 삭제할 수 있습니다.' });
    }
  } catch (error) {
    return res
      .status(400)
      .send({ errorMessage: '본인이 작성한 댓글만 삭제할 수 있습니다.' });
  }
});

module.exports = router;
