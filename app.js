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


// ------------------------------------------------------------------------------
// Definition: Connecting to the MongoDB databse on Mongodb.atlas
// Variables:
//   MONGODB_URI: The mongodb string gien in mongodb.alas to connect to the UserData DB
// ------------------------------------------------------------------------------
//Note the word UserData in the following string is the name of the DB
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
app.use(express.static('./public/'));

//Bring in Models from models folder
let User = require('./models/user');
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
var Pics = mongoose.model('Pics',PicsSchema);

// ------------------------------------------------------------------------------
//  app.get() -> Displays the ejs file specified
//
// Definition: Render's the user's profile page with all data taken from user collection in DB
//
// Variables:
//   id:        The id of the current logged on user
//   username:  The id of the user who has been searched
//   docs:      All data from the database associated with the user id is stored in docs
//      docs.username:  Get the string value of the username pertaining to the req.params.id
//      docs.firstname: Get the string value of the firstname pertaining to the req.params.id
//      docs.lastname:  Get the string value of the latname pertaining to the req.params.id
//      docs.password:  Get the string value of the password pertaining to the req.params.id
//      docs.followers: Returns array of all the followers following the user req.params.id
//      docs.following: Returns array of all the users following the user req.params.id
//      docs.bio:       Returns the user's bio
//
//   NOTE: - req.params.id gets the id coming from the url (:id)
//         - In res.render(), there are variables being declared on the left side,
//              ex. username: docs.username
//                The variable on the left is the variable being used in the Profile_Page.ejs file.
//                To use variables in the ejs file, do: <%=username%> wherever needed.
//
// ------------------------------------------------------------------------------
app.get('/Profile_Page/:id',function(req,res){
  //findById returns object NOT Array of objects
User.findById(req.params.id,function(error,docs){
Pics.find({ownerID:req.params.id}, function(error,imgDocs){

  res.render('Profile_Page',{ id:req.params.id,
                                username:docs.username,
                                followers:docs.followers.length,
                                following:docs.following.length,
                                bio:docs.bio,
                                imgData:imgDocs
                              }); //in ejs file do <%=username%>
  });
});
});
// ------------------------------------------------------------------------------
//  app.post() -> Gets any written text or action (submit)and performs operations
//
//  Variables:
//      req.params.id:     The user's id obtained from the url
//      req.body.search:   Gets the text written in the search text field (name of field is "search")
// ------------------------------------------------------------------------------
app.post('/Profile_Page/:id',function(req,res){

  res.redirect('/Search_Page/'+req.params.id+'/'+req.body.search);

});

// ------------------------------------------------------------------------------
/*  Path name: /Login_Page

    Definition: Gets all data from the text fields and checks to see if the data entered
                exists and is correct. If correct then page redirects to /Profile_Page,
                if not then pages redirects to /Login_Page.

    Variables:
        req:      Request from page.
        res:      Response from page.
        userName: String which stores the text inputted by the user in the username textfield.
        passWord: String which stores the text inputted by the user in the password textfield.
        docs:     Object which contains all data pertaining to the username found by User.find().
        sid:      string which conatins the user's id obtained from he url (req.params.id).
*/
// ------------------------------------------------------------------------------

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

// ------------------------------------------------------------------------------
/*  Path name: /Create_Account_Page

    Definition: Gets all data entered in the textfields and validates to see if the user
                already exists. If the user already exists, then the age will redirect to
                /Create_Account_Page. If the user does not exist, the data will be stored in the DB.

    Variables:
        req:      Request from page.
        res:      Response from page.
        user:     Object from the model Users() -> which is the UserSchema located in /models/user.js
          user.username:  String data obtained from the username textfield.
          user.password:  String data obtained from the password textfield.
          user.firstname: String data obtained from the firstname textfield.
          user.lastname:  String data obtained from the lastname textfield.
        count:    The count of user's that have the username searched.
                  Either 0 or 1. If 0 then username does not exist.
                                 If 1 then username is already taken.
*/
// ------------------------------------------------------------------------------
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

// ------------------------------------------------------------------------------
/*  Create storage Engine

    Definition: Creates the GridFsStorage. Used for storing images in Post_Photo_Page.ejs

    Variables:
      url:    The url to access the mongoDB database.
      file:   Object which contains all information pertaining to the image selected
      filename: String of the hexed name of the image with specific extension (file.contentType).
*/
// ------------------------------------------------------------------------------
const storage = new GridFsStorage({
  url: MONGODB_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = /*buf.toString('hex')*/date() + file.originalname;
        console.log(filename + "  storage");
        const fileInfo = {
          filename: filename,
          bucketName: 'pics' //Has to match the collection name gfs.collection('pics');
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({ storage: storage }).single('file');

const localStorage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, cb) {
    var filename = date() + file.originalname;
    console.log(filename + "  localStorage");
    cb(null,filename);
  }
});

//file in the next line is the fieldname from the Post_Photo_Page_ejs file
const uploadLocal = multer({ storage: localStorage }).single('file');

// ------------------------------------------------------------------------------
/*  app.post('/upload/:id')

    Definition: Stores the image selected in Post_Photo_Page into the pic DB in mongoDB.

    Variables:
      image;                    Object of the model Pics() of PicsSchema located in /models/pics.js
        image.ownerID:          String which conatins the user's id who is posting the picture.
        image.img.imgName:      String which containing the hexed filename name of the image.
        image.imdg.contentType: String containing the contentType (jpg or jpeg).
        image.date:             String of the date and time when image is posted
                                YYYY-MM-DD HH:MM:SS format
        image.caption:          String which conatins the user's caption.
        image.location:         String containing the user's location.
      req.file:   Object which contains all information pertaining to the image selected
                  Can see all fields by inserting code: console.log(file);

*/
// ------------------------------------------------------------------------------
app.post('/upload/:id'/*,upload.single('file')*/,(req, res)=> {

  upload(req,res,(err) => {
    //Callback function with parameter err
    if (err) {
      console.log("Failed to upload to local storage");
    }
    else {
      image = new Pics();
      image.ownerID = req.params.id;
      image.img.imgName = req.file.filename;
      image.img.contentType = req.file.contentType;
      //image.caption=req.body.caption;

      console.log(req.body.caption);
      var currentDate = date();

      image.date = currentDate;

      image.save(function(err){
        if(err){
          console.log(err);
          return;
        }else {
          console.log("Saved Image to the database");
        }
      });
    }
  });

  //Calls the function uploadLocal
  uploadLocal(req,res,(err) => {
    //Callback function with parameter err
    if (err) {
      console.log("Failed to upload to local storage");
    }
    else {
      console.log("Image saved");
      //Go back to user's profile page
      res.redirect('/Profile_Page/'+req.params.id);
    }
  });
});


// ------------------------------------------------------------------------------
/*  app.get('/Search_Page/:id/:name')

    Definition: Renders the Search_Page with all usernames queried from the DB which
                contains the searched parameter (req.params.name)

    Variables:
      docs:   Object contains all information pertaining to the username fonud by User.find().
      data:   Object which is used in the Search_Page.ejs which holds all fields from docs.
              (data[0].username, data[1].username, data.[0].lastname...)

      NOTE: The Users.find() oly returns _id, firstname, lastname and username.
*/
// ------------------------------------------------------------------------------
app.get('/Search_Page/:id/:name',function(req,res){

  Users.find({username:{$regex: req.params.name, $options: "i"}},'firstName lastName username',{lean: true},
          function(err, docs){
    res.render('Search_Page',{id:req.params.id,
                              data: docs});
  });
});

// ------------------------------------------------------------------------------
// Definition: Follow_Page is the page of the user who correspong to the searchID.
//             This page contains a follow button and all information realting to the searched user
//             This function populates the Follow_Page.ejs with a specific user's data
// Variables:
//   id:        The id of the current logged on user
//   searchID:  The id of the user who has been searched
//   docs:      All data which is associated with the sechID
//   sFollow:   The string for the button -> Either "Follow" or "Unfollow"
//
//   NOTE: req.params.id gets the id coming from the url (:id)
//         req.params.searchID get the searchID from the url (:searhID)
//
// ------------------------------------------------------------------------------
app.get('/Profile_Page/:id',function(req,res){
  //findById returns object NOT Array of objects
User.findById(req.params.id,function(error,docs){
Pics.find({ownerID:req.params.id}, function(error,imgDocs){
  res.render('Profile_Page',{ id:req.params.id,
                                username:docs.username,
                                followers:docs.followers.length,
                                following:docs.following.length,
                                bio:docs.bio,
                                imgData:imgDocs
                              }); //in ejs file do <%=username%>
  });
});
});
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

// ------------------------------------------------------------------------------
/*  app.post('/Follow_Page/:id/:searchID/:follow')

    Definition: Checks to see if the parameter :follow is "Follow" or "Unfollow".
                Depending on :follow, this function will either remove the searchID
                user from the 'following' array of the user's id and remove the user's id
                from the 'followers' array of the searchID user or it will update the arrays.

                searchID user: The us that was looked up.
                user id:       The logged on user (main).

    Variables:
      isFollow: Boolean which determines if the use wants to Follow or Unfollow another user.
*/
// ------------------------------------------------------------------------------
//This is where the current user can follow as well as comment on another person's image
app.post('/Follow_Page/:id/:searchID/:follow',function(req,res){

  var isFollow = true;

  if(req.params.follow == "Unfollow")
  {
    isFollow = false
  }

  //------------------------ Update database ----------------------------
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
function date()
{
  let dateObj = new Date();
  // current date
  let date = ("0" + dateObj.getDate()).slice(-2);
  let month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
  let year = dateObj.getFullYear();
  let hours = dateObj.getHours();
  let minutes = dateObj.getMinutes();
  let seconds = dateObj.getSeconds();

  return year + "-" + month + "-" + date + "-" + hours + "_" + minutes + "_" + seconds;
}

//Start Server
// res.render won't do anythng unless listen is called
app.listen(3000, function(){
  console.log("Server started on port 3000...");
});
