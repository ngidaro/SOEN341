// -----------------------------------------------------------------------------------------------------------------------------
/*  Definition: The Schema for the Users collection the in mongoDB datatbase

    Fields:
      _id:                The mongoDB autogenerated id of the user.
      username:           The username of the user.
      password:           The password of the user.
      firstName:          The First Name of the user.
      lastName:           The Last Name of the user.
      bio:                The biography of the user. The content can be changed by the users
                          on their profile page.
      followers:          Array containing the _id of the users following the "current" user.
      following:          Array containing the _id of the users that the "current" user is following.
      profilePic:         Contains the name of the image which is found in the /public/uploads folder.
                          The contents can be dynamically changed by the user.
      email:              The email address of the user.
      profileSettings:    Object containing the fields required to make the user's profile unique.
          textColor:      Hexadecimal value of the color the user wants to have for the text on their profile page
          bgColor:        Hexadecimal value of the color for the background on the user's profile page.
          bgImg:          The name of the background image which is shown on the user's profile page.
*/
// -----------------------------------------------------------------------------------------------------------------------------
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
  type:String,
  required: true
  },
  profileSettings:{

    textColor:{
      type: String,
      required:true
    },
    bgColor:{
      type: String,
      required:true
    },
    bgImg:{
      type: String,
      required:true
    }
  }
});

let User = module.exports = mongoose.model('User',UserSchema);
