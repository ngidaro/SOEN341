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
  followers:{
    type:Array,
    required: false
  },
  following:{
    type:Array,
    required: false
  },
  bio:{
    type:String,
    required: false
  },

});

let User = module.exports = mongoose.model('User',UserSchema);
