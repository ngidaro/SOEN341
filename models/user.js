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
  bio:{
      type:Array,
      required: false
  },
  followers:{
    type:Array,
    required: false
  },
  following:{
    type:Array,
    required: false
  },
  profilePic:{
    type:Array,
    required: true
  },
email:{
  type:Array,
  required: true
}
});

let User = module.exports = mongoose.model('User',UserSchema);
