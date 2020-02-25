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
    type:String,
    required: false
  },
  location:{
    type:String,
    required: false
 }
});

let Pics = module.exports = mongoose.model('Pics',PicsSchema);
