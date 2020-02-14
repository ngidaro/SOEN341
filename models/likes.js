mongoose = require('mongoose');

LikeSchema = mongoose.Schema({

  userID:{
    type: String,
    required: true
  },

  postID:{
    type:String,
    required: true
  },
  username:{
    type:String,
    required: true
  }
});

let Likes=module.exports = mongoose.model('Likes',LikeSchema);
