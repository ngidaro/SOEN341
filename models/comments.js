mongoose = require('mongoose');

CommentSchema = mongoose.Schema({

  userID:{
    type:String,
    required: true
  },

  postID:{
    type:String,
    required: true
  },
  username:{
    type:String,
    required: true
  },
  comment:{
    type:String,
    required: true
  },
  date:{
    type:String,
    required: true
  }
});

let Comments = module.exports = mongoose.model('Comments',CommentSchema);
