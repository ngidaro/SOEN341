mongoose = require('mongoose');

LikeSchema = mongoose.Schema({

  postID:{
    type:String,
    required: true
  },
  username:{
    type:String,
    required: true
  }
});

let likes=module.exports = mongoose.model('likes',LikeSchema);