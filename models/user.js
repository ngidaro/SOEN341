mongoose = require('mongoose');

UserSchema = mongoose.Schema({

  username:{
    type:String,
    required: true
  },
  password:{
    type:String,
    required: true
  },
  firstName:{
    type:String,
    required: true
  },
  lastName:{
    type:String,
    required: true
  },
  nbFollowers:{
    type:Number,
    required: true
  },
  nbFollowing:{
    type:Number,
    required: true
  },
  bio:{
    type:String,
    required: false
  },
  nbPosts:{
    type:Number,
    required:false
  }

});

let User = module.exports = mongoose.model('User',UserSchema);
