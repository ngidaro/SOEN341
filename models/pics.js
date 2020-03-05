mongoose = require('mongoose');

PicsSchema = mongoose.Schema({

  ownerID:{
    type: String,
    required: true
  },
  img:{
   imgName: String,
   contentType:String,
  },
  date:{
    type:String,
    required: true
  },
  caption:{
    type:Array,
    required: false
  },
  likes:{
    type:Array,
    required: false
  },
  location:{
    type:String,
    required: false
 },
 comments:{
   type:Array,
   required: false
 }
});

let Pics = module.exports = mongoose.model('Pics',PicsSchema);
