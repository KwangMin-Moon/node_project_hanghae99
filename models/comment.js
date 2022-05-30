const mongoose = require('mongoose');
const CommentSchema = new mongoose.Schema({
  comment: String,
  userInfo: String,
  commentNum: Number,
  postId: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
CommentSchema.virtual('userId').get(function () {
  return this._id.toHexString();
});
CommentSchema.set('toJSON', {
  virtuals: true,
});
module.exports = mongoose.model('comment', CommentSchema);
