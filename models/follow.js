mongoose = require('mongoose');

FollowSchema = mongoose.Schema({

  userID:{
    type: String,
    required: true
  },
  username:{
    type:String,
    required: true
  },
  followUserID:{
    type:String,
    required: true
}

});

let Follow = module.exports = mongoose.model('Follow',FollowSchema);
