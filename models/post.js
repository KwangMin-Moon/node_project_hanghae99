const mongoose = require('mongoose');
const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  userInfo: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  comment: String,
});
PostSchema.virtual('userId').get(function () {
  return this._id.toHexString();
});
PostSchema.set('toJSON', {
  virtuals: true,
});
module.exports = mongoose.model('Post', PostSchema);
