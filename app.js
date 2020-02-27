//When running in command, do node app.js
// OR do npm start which will run this file (see package.json file "start")
  //Instead type command: nodemon -> this will start the server and reload it everytime js file is updated

//Go to localhost:3000 in browser to see the page
//When you change something in the javascript, you have to restart the server -> Nodemon makes it so that you don't have to restart the server each time
//PUG doesn't require html tags, you can simply write h1 Hello World -> Same as <h1>Helllo World</h1>

//Will need to use res.render('Page') as a template


const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const ejs = require('ejs');

const router = express.Router();

//Setup the configuration to connect to remote server
// mongodb+srv://soen341:soen341@clustersoen341-bbtjh.mongodb.net/test?retryWrites=true&w=majority
// mongodb+srv://mando:mando@341db-i1fo2.mongodb.net/test?retryWrites=true&w=majority


//Note the word User in the following string is the name of the DB
const MONGODB_URI = 'mongodb+srv://soen341:soen341@clustersoen341-bbtjh.mongodb.net/UserData?retryWrites=true&w=majority'
mongoose.connect(MONGODB_URI,{useNewUrlParser:true, useUnifiedTopology:true});
// mongoose.connect('mongodb://localhost:27017');

let db = mongoose.connection;
//Init GrifFsStorage
let gfs;

//init stream
//Check Connection
db.once('open',function(){
  console.log("Connected to MongoDB Remote Server");
  gfs = Grid(db, mongoose.mongo)
  gfs.collection('pics');
});

//Check for DB errors
db.on('error',function(err){
  console.log(err);
});

//Init app
const app = express();

//Body parser middleware
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
//parse application/json
app.use(bodyParser.json());
app.use(methodOverride('_method'));


//Bring in Models
let User = require('./models/user');
let Comment = require('./models/comments');
let Follow = require('./models/follow');
let Like = require('./models/likes');
let Pic = require('./models/pics')

//Load View Engine
app.set('view engine','ejs');

//Will add the css and images to the app
//'front_end is the folder which contains the images and css folder'
app.use(express.static('front_end'));

//Home Route
app.get('/',function(req,res){
  res.render("Login_Page");
});

//Add Route
app.get('/Login_Page',function(req,res){
  //Send something to the browser -> in this case its whats writen in index.pug -> if not html-> res.render(filename)
  res.render("Login_Page");
});

app.get('/Create_Account_Page',function(req,res){
  res.render("Create_Account_Page");
});

app.get('/Post_Photo_Page/:id',function(req,res){
    res.render('Post_Photo_Page',{id:req.params.id});
});

//NOTE: 'User',Comment,etc is defined when we bring in the models
var Users = mongoose.model('User',UserSchema);
var Comments = mongoose.model('Comment',CommentSchema);
var Follows = mongoose.model('Follow',FollowSchema);
var Likes = mongoose.model('Like',LikeSchema);
var Pics = mongoose.model('Pics',PicsSchema);

app.get('/Profile_Page/:id',function(req,res){

  //findById returns object NOT Array of objects
  User.findById(req.params.id,function(error,docs){

  res.render('Profile_Page',{ id:req.params.id,
                                username:docs.username,
                                followers:docs.followers.length,
                                following:docs.following.length,
                                bio:docs.bio,
                                nbPosts:docs.nbPosts}); //in ejs file do <%=username%>
  });
});

app.post('/Profile_Page/:id',function(req,res){

  res.redirect('/Search_Page/'+req.params.id+'/'+req.body.search);

});

//Sign In page: method = post
app.post('/Login_Page',function(req,res) {

  var userName = req.body.user;
  var passWord = req.body.pass;

  Users.find({username:userName},'username password',{lean: true}, function(err, docs){
   if (err) return handleError(err);

   //If no username exists in the database:
   if (docs.length == 0)
   {
     console.log('Invalid UserName and Password');
     res.redirect('/Login_Page');
   }
   else {
     //Verify that the username and password are correct
     if((docs[0].username == userName) && (docs[0].password == passWord))
     {
       console.log('Username and Password Correct');
       var sId = docs[0]._id;
       console.log(sId);
       res.redirect('/Profile_Page/' + sId);
     }
     else {
       console.log('Invalid UserName and Password');
       res.redirect('/Login_Page');
     }
   }


 });
});

//Profile Page Router
//req.params.id is the id coming in from url
//So if user presses an object, it will load to new screen ../:id
// app.get('/Profile_Page/:id',function(req,res){
//   Users.findById(req.params.id,function(error,docs){
//     console.log(docs);//Will print all of info for the Id
//     return;
//   })
// })

//post data to DB when in createaccount package
app.post('/Create_Account_Page',function(req,res){

  let user = new Users();

  user.username = req.body.user;
  user.password = req.body.pass;
  user.firstName = req.body.fName;
  user.lastName = req.body.lName;

  Users.count({username: user.username}, function (err, count){
    if(count>0){
        console.log("Username already exists");
        res.redirect('/Create_Account_Page')
    }
    else {
      user.save(function(err){
        if(err){
          console.log(err);
          return;
        }else {
          console.log("Saved User to the database");
          res.redirect('/Login_Page');
        }
      });
    }
  });
});

//Create storage Engine
const storage = new GridFsStorage({
  url: MONGODB_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'pics'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });

app.post('/upload/:id',upload.single('file'),(req, res)=> {
  image = new Pics();

  image.ownerID = req.params.id;
  image.img.imgName = req.file.filename;
  image.img.contentType = req.file.contentType;

  let dateObj = new Date();
  // current date
  let date = ("0" + dateObj.getDate()).slice(-2);
  let month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
  let year = dateObj.getFullYear();
  let hours = dateObj.getHours();
  let minutes = dateObj.getMinutes();
  let seconds = dateObj.getSeconds();
  let currentDate = year + "-" + month + "-" + date + "-" + hours + ":" + minutes + ":" + seconds;
  // prints date & time in YYYY-MM-DD HH:MM:SS format
  console.log(currentDate);
  image.date = currentDate;

  image.save(function(err){
    if(err){
      console.log(err);
      return;
    }else {
      console.log("Saved Image to the database");
      //Go back to user's profile page
      res.redirect('/Profile_Page/'+image.ownerID);
    }
  });
  // res.json({ file: req.file })
});

app.get('/Search_Page/:id/:name',function(req,res){

  Users.find({username:{$regex: req.params.name, $options: "i"}},'firstName lastName username',{lean: true},
          function(err, docs){
    res.render('Search_Page',{id:req.params.id,
                              doc: docs});
    // res.json({doc: docs});
    // console.log(docs.length);
  });
});

// ------------------------------------------------------------------------------
// Definition: Follow_Page is the page of the user who correspong to the searchID.
//             This page contains a follow button and all information realting to the searched user
//             This function populates the Follow_Page.ejs with a specific user's data
// Variables:
//   id =        The id of the current logged on user
//   searchID =  The id of the user who has been searched
//   docs =      All data which is associated with the sechID
//   sFollow =   The string for the button -> Either "Follow" or "Unfollow"
//
//   NOTE: req.params.id gets the id coming from the url (:id)
//         req.params.searchID get the searchID from the url (:searhID)
//
// ------------------------------------------------------------------------------
app.get('/Follow_Page/:id/:searchID',function(req,res){

  User.findById(req.params.searchID,function(error,docs){
    if (error) return handleError(error);

    //Check to see if user already follows the person, if he does then display Unfollow
    var sFollow = "Follow";
    var userID = req.params.id;
    var foundID = (docs.followers.find(valueIS => userID));

    //the searchID user does not have any followers
    if(docs.followers.length != 0)
    {
      if(req.params.id == foundID)
      {
        sFollow = "Unfollow";
      }
    }

    res.render('Follow_Page',{ id:req.params.id,
                                searchID:req.params.searchID,
                                username:docs.username,
                                followers:docs.followers.length,
                                following:docs.following.length,
                                sFollow: sFollow,
                                bio:docs.bio,
                                nbPosts:docs.nbPosts});
  });
});

//This is where the current user can follow as well as comment on another person's image
app.post('/Follow_Page/:id/:searchID/:follow',function(req,res){

  console.log("clicked");
  console.log(req.params.follow);
  var isFollow = true; //To know if we are following or unfollowing

  if(req.params.follow == "Unfollow")
  {
    isFollow = false
  }

  //Update database --------------------------------------------------
  //Manipulate userID from 'followers' in searhID-user DB
  if(isFollow)
  {
    //Add users to the followers in the DB
    User.updateOne({_id:req.params.searchID},{$push: {followers: req.params.id}},function (error, success) {
        saved(error,success);
    });
    //Add users to the following in the DB
    User.updateOne({_id:req.params.id},{$push: {following: req.params.searchID}},function (error, success) {
        saved(error,success);
    });
  }
  else {
    //Delete users from the followers in the DB
    User.updateOne({_id:req.params.searchID},{$pull: {followers: req.params.id}},function (error, success) {
        saved(error,success);
    });
    //Delete users from the following in the DB
    User.updateOne({_id:req.params.id},{$pull: {following: req.params.searchID}},function (error, success) {
        saved(error,success);
    });
  }
  //------------------------------------------------------------------

  res.redirect('/Follow_Page/' + req.params.id + '/' + req.params.searchID);
});

function saved(error,success)
{
    if (error) {
        console.log(error);
    } else {
        console.log(success);
    }
}

//Start Server
// res.send won't do anythng unless listen is called
app.listen(3000, function(){
  console.log("Server started on port 3000...");
});
