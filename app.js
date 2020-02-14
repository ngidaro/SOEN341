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
const expressValidator = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

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

//Load View Engine
app.set('views',path.join(__dirname,'front_end')); // Folder called views
//app.set('view engine','html'); // set it to pug -> define 'view engine' as 'pug'

//Will add the css and images to the app
//'front_end is the folder which contains the images and css folder'
app.use(express.static('front_end'));

//Home Route
app.get('/',function(req,res){
  //Send something to the browser -> in this case its whats writen in index.pug -> if not html-> res.render(filename)
  res.sendfile("front_end/Login_Page.html");

});

//Add Route
app.get('/Create_Account_Page',function(req,res)
{
  res.sendfile("front_end/Create_Account_Page.html");
});

app.get('/Profile_Page',function(req,res){
  res.sendfile("front_end/Profile_Page.html");
});

app.get('/Post_Photo_Page',function(req,res){
  res.sendfile("front_end/Post_Photo_Page.html");
});

var Users = mongoose.model('User',UserSchema);

//Sign In page: method = get
app.post('/Login_Page',function(req,res) {

  var userName = req.body.user;
  var passWord = req.body.pass;

  console.log(userName);
  console.log(passWord);

  Users.find({username:'ngidaro'},'username password',{lean: true}, function(err, docs){
    if (err) return handleError(err);

    // let userData = '{ "name": "John", "age": 35, "isAdmin": false, "friends": [0,1,2,3] }';

    // var parseDoc = JSON.parse(docs);

    console.log("%s %s",docs[0].username,docs[0].password);

    if(docs[0].username == userName && docs[0].password == passWord)
    {
      console.log('Username and Password Correct');
      res.redirect('/Profile_Page');
    }
    else {
      console.log('Invalid UserName and Password');
      res.redirect('/');
    }

  });


  //if data is correct:
  //var id = docs.id;
  //app.redirect('/Profile_Page/:id');

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

  // console.log(req.body);

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
          console.log("Saved to the database");
          res.redirect('/');
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
