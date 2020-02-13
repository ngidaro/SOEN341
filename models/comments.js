mongoose = require('mongoose');

CommentSchema = mongoose.Schema({

  postID:{
    type:String,
    required: true
  },
  username:{
    type:String,
    required: true
  },
  comment{
    type:String,
    required: true
  },
  date:{
    type:String,
    required: true
});

let comments= module.exports = mongoose.model('comments',CommentSchema);