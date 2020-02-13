mongoose = require('mongoose');

PicsSchema = mongoose.Schema({

//  username:{
  //  type:String,
   // required: true
  //},
 // postID:{
 //   data: Buffer,
   //type:String,
    //required: true
  //},
    //picture:{
    //}

  //date:{
    //type:String,
    //required: true
  //caption:{
    //type:String,
   // required: true
 // },
  //location:{
    //type:String,
   // required: true
 // }
});

let Pics= module.exports = mongoose.model('Pics',PicsSchema);
