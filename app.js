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

// app.get('/Profile_Page/:id',function(req,res){
//   res.render("Profile_Page");
// });

app.get('/Post_Photo_Page/',function(req,res){
    // Users.findById(req.params.id,function(error,docs){
    //
    // })
    res.render('Post_Photo_Page'); //in ejs file do <%=username%>
});

//NOTE: 'User',Comment,etc is defined when we bring in the models
var Users = mongoose.model('User',UserSchema);
var Comments = mongoose.model('Comment',CommentSchema);
var Follows = mongoose.model('Follow',FollowSchema);
var Likes = mongoose.model('Like',LikeSchema);

app.get('/Profile_Page/:id',function(req,res){
  //findById returns object NOT Array of objects
  User.findById(req.params.id,function(error,docs){
    // var username = "";
    // var followers = 99;
    // var following = 99;
    // var bio = "";
    // var nbPosts = 0;

    res.render('Profile_Page',{ username:docs.username,
                                followers:docs.nbFollowers,
                                following:docs.nbFollowing,
                                bio:docs.bio,
                                nbPosts:docs.nbPosts}); //in ejs file do <%=username%>
  });
});

//Sign In page: method = post
app.post('/Login_Page',function(req,res) {

  var userName = req.body.user;
  var passWord = req.body.pass;

  Users.find({username:userName},'username password',{lean: true}, function(err, docs){
   if (err) return handleError(err);

   console.log("%s %s",docs[0].username,docs[0].password);

   if(docs[0].username == userName && docs[0].password == passWord)
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
//post must be same route as route in the action of the form in html file.
//Make sure the method in the html file is "post"
app.post('/Create_Account_Page',function(req,res){

  let user = new Users();
  let comment = new Comments();
  let follow = new Follows();
  let likes = new Likes();

  user.username = req.body.user;
  user.password = req.body.pass;
  user.firstName = req.body.fName;
  user.lastName = req.body.lName;
  user.nbFollowers = 0;
  user.nbFollowing = 0;

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

app.post('/upload',upload.single('file'),(req, res)=> {
  console.log("Image saved");
  res.json({ file: req.file })
})
//Start Server
// res.send won't do anythng unless listen is called
app.listen(3000, function(){
  console.log("Server started on port 3000...");
});
