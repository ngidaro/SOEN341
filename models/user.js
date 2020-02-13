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
  }

});

let User = module.exports = mongoose.model('User',UserSchema);
