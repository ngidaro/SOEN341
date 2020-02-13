mongoose = require('mongoose');

FollowSchema = mongoose.Schema({

  username:{
    type:String,
    required: true
  },
  following:{
    type:String,
    required: true
}

});

let follow = module.exports = mongoose.model('follow',FollowSchema);