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
var fs = require('fs');

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


//NOTE: 'User',Comment,etc is defined when we bring in the models
var Users = mongoose.model('User',UserSchema);
var Pics = mongoose.model('Pics',PicsSchema);

//Home Route
app.get('/',function(req,res){
  res.render("login_page");
});

//Add Route
app.get('/login_page',function(req,res){
  res.render("login_page");
});

app.get('/create_account_page',function(req,res){
  res.render("create_account_page");
});

app.get('/post_photo_page/:id',function(req,res){
    res.render('post_photo_page',{id:req.params.id});
});

app.get('/post_profile_pic/:id',function(req,res){

  User.findById(req.params.id,function(error,docs){
    res.render('Post_Profile_Pic',{id:req.params.id,
                                   profilePic:docs.profilePic});
  });
});

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
//                The variable on the left is the variable being used in the profile_page.ejs file.
//                To use variables in the ejs file, do: <%=username%> wherever needed.
//
// ------------------------------------------------------------------------------
app.get('/profile_page/:id',function(req,res){
  //findById returns object NOT Array of objects
  Users.findById(req.params.id,function(error,docs){
    Pics.find({ownerID:req.params.id}, function(error,imgDocs){
      res.render('profile_page',{ id:req.params.id,
                                    username:docs.username,
                                    followers:docs.followers.length,
                                    following:docs.following.length,
                                    bio:docs.bio,
                                    imgData:imgDocs,
                                    backgroundImg:docs.backgroundImg[0],
                                    backgroundColor:docs.backgroundColor[0],
                                    profilePicture:docs.profilePic
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
app.post('/profile_page/:id',function(req,res){

  res.redirect('/search_page/'+req.params.id+'/'+req.body.search);

});

app.post('/profile_page/:id/:imgName',function(req,res){

  Pics.find({"img.imgName":req.params.imgName}, function(error,imgDocs){

    res.json({imgData:imgDocs[0]});

  });


});
// ------------------------------------------------------------------------------
/*  Path name: /login_page

    Definition: Gets all data from the text fields and checks to see if the data entered
                exists and is correct. If correct then page redirects to /profile_page,
                if not then pages redirects to /login_page.

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
app.post('/login_page/:userName/:passWord', function (req,res) {

  Users.find({username:req.params.userName},'username password',{lean: true}, function(err, docs){
   // if (err) return res.json({bExists:false,error:handleError(err)});

   //If no username exists in the database:
   if (docs.length == 0)
   {
     console.log('Invalid Username and Password');
     res.json({bExists:false,
              id: sId});
   }
   else {
     //Verify that the username and password are correct
     if((docs[0].username == req.params.userName) && (docs[0].password == req.params.passWord))
     {
       console.log('Username and Password Correct');
       var sId = docs[0]._id;
       // res.redirect('/profile_page/' + sId);
       res.json({bExists:true,
                id: sId});
     }
     else {
       console.log('Invalid UserName and Password');
       res.json({bExists:false,
                id: sId});
     }
   }
 });
});

// ------------------------------------------------------------------------------
/*  Path name: /create_account_page

    Definition: Gets all data entered in the textfields and validates to see if the user
                already exists. If the user already exists, then the age will redirect to
                /create_account_page. If the user does not exist, the data will be stored in the DB.

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
app.post('/create_account_page', function(req,res){

  let user = new Users();

  user.profilePic = "undefined_profile.png";
  user.username = req.body.user;
  user.password = req.body.password;
  user.firstName = req.body.fname;
  user.lastName = req.body.lname;
  user.email=req.body.email;
  user.backgroundColor= "#ffffff";
  user.backgroundImg="bg-masthead.jpg";

  Users.countDocuments({username: user.username}, function (err, count){
    if(count>0){
        console.log("Username already exists");
        res.json({userExists  : true,
                  userID: 0});
    }
    else {
      user.save(function(err,docs){
        if(err){
          console.log(err);
          return;
        }else {
          console.log("Saved User to the database");
          res.json({userExists: false,
                    userID: docs._id});
        }
      });
    }
  });

});

// ------------------------------------------------------------------------------
/*  Create storage Engine

    Definition: Creates the GridFsStorage. Used for storing images in post_photo_page.ejs

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
        // console.log(filename + "  storage");
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

//file in the next line is the fieldname from the post_photo_page_ejs file
const uploadLocal = multer({ storage: localStorage }).single('file');

// ------------------------------------------------------------------------------
/*  app.post('/upload/:id')

    Definition: Stores the image selected in post_photo_page into the pic DB in mongoDB.

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
      User.findById(req.params.id,function(err,docs){
        image = new Pics();
        image.ownerID = req.params.id;
        image.ownerUsername = docs.username;
        image.img.imgName = req.file.filename;
        image.img.contentType = req.file.contentType;
        image.caption=req.body.caption;

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
      //There is a timeout because when an image is posted it does not display in the user profile right away
      setTimeout(function()
      {
        res.redirect('/profile_page/'+req.params.id);
      },300);
    }
  });
});

// ------------------------------------------------------------------------------
/*  app.post('/upload_profile/:id/:currentProfileImg')

    Definition: When the user uploads a new profile image, the name of the image
                will be stored in the User database. Also the previous profile image
                gets overriden in the database and gets deleted on the local machine.
                NOTE: if the image is the "undefined_profile.png", the image will not
                      be deleted.

    Variables:
      id:                   The user's id.
      currentProfileImg:    The current profile image of the user.
*/
// ------------------------------------------------------------------------------
//Upload Profile picture
app.post('/upload_profile/:id/:currentProfileImg',(req, res)=> {

  if(req.params.currentProfileImg != "undefined_profile.png")
  {
    fs.unlink('public/uploads/'+req.params.currentProfileImg, function (err) {
      if (err) throw err;
      console.log("profile image deleted");
    });
  }

  uploadLocal(req,res,(err) => {
    //Callback function with parameter err
    if (err) {
      console.log("Failed to upload to local storage");
    }
    else {

      User.findOneAndUpdate({_id:req.params.id},{$set: {profilePic: req.file.filename}},{new: true},function (error, docs) {
          saved(error,docs);
          console.log("Image saved");
          res.redirect('/profile_page/'+req.params.id);
      });
    }
  });
});

// ------------------------------------------------------------------------------
/*  app.post('/delete_photo/:imgName')

    Definition: When the user presses the delete button, the user's photo will be
                deleted from the database as well as the local machine.

    Variables:
      bDeleted:             Returns true if image was succesfully deleted.
      req.params.imgName:   The name of the image the user wants to delete.
*/
// ------------------------------------------------------------------------------

//When the delete button is pressed, the image will be deleted from the DB and from local machine
app.post('/delete_photo/:imgName',function(req,res){

  var bDeleted = false;

  Pics.deleteOne({"img.imgName":req.params.imgName},function(err,response){
    if (err) return handleError(err);

    fs.unlink('public/uploads/'+req.params.imgName, function (err) {
      if (err) throw err;
    });

    bDeleted = true;
    res.json({bDeleted:bDeleted});
  });
});

// ------------------------------------------------------------------------------
/*  app.get('/search_page/:id/:name')

    Definition: Renders the search_page with all usernames queried from the DB which
                contains the searched parameter (req.params.name)

    Variables:
      docs:   Object contains all information pertaining to the username fonud by User.find().
      data:   Object which is used in the search_page.ejs which holds all fields from docs.
              (data[0].username, data[1].username, data.[0].lastname...)

      NOTE: The Users.find() oly returns _id, firstname, lastname and username.
*/
// ------------------------------------------------------------------------------
app.get('/search_page/:id/:name',function(req,res){

  Users.find({username:{$regex: req.params.name, $options: "i"}}, function(err, docs){

    res.render('search_page',{id:req.params.id,
                              data: docs,
                              profilePicture: docs.profilePic
                            });
  });
});

// -------------------------------------------------------------------------------------------
// Definition: news_need is the page where the user can view all the images of the users that
//             they follow. The images are displayed from newest to oldest.
// Variables:
//   id:                  The id of the current logged on user
//   displayImage:        Array which contains all the images info to be displayed on the feed
//   docs:                All data which is associated with the user's ID
//   images:              All image data pertaining to the person being followed by the current user
//   storeFollowedUsers:  Array which contains all the info pertaing to the users being followed by the
//                        current User
//
// -------------------------------------------------------------------------------------------
app.get('/news_feed/:id',function(req,res){

  var displayImages = [];
  var storeFollowedUsers = [];

  Users.findById(req.params.id,function(error,docs){

    for (var i = 0; i < docs.following.length; i++)
    {
      //Find all the user's that the current user is following and store their data.
      Users.findById(docs.following[i],function(err,followedUser){
        storeFollowedUsers.push(followedUser);
      });

      //Store all images in an array
      Pics.find({ownerID:docs.following[i]},function(error,images)
      {
        for (var j = 0; j < images.length; j++)
        {
          displayImages.push(images[j]);
        }
      });
    }

    //Also add the current user's photos to the news feed
    Pics.find({ownerID:req.params.id},function(err,images){
      for (var i = 0; i < images.length; i++) {
        displayImages.push(images[i]);
      }
    });

    //The User.find... is needed so that this app.get can execute sequentially
    //If the User.find... is not there then the screen will render before performing the above loops
    Users.findById(req.params.id,function(error,documents){
      // console.log(displayImages.length);

      //Store current User
      storeFollowedUsers.push(documents);
      // console.log(storeFollowedUsers);

      //wait 1 second before rendering the news_feed -> need time to loop through files for images
      setTimeout(function(){
        res.render('news_feed',{ id:req.params.id,
                                      username:docs.username,
                                      followers:docs.followers.length,
                                      following:docs.following.length,
                                      bio:docs.bio,
                                      imgData:displayImages.sort(),
                                      followedUsers:storeFollowedUsers
                                    });
      },250);

    });
  });
});

// ------------------------------------------------------------------------------
/*  app.get('/show_comments/:imgName')

    Definition: When "show all" button is clicked, this section executes.
                It displays all the comments associated with a specific image.
                Does a query to the DB for all users who commented on the photo and their profile.

    Variables:
      allComments:        Array, temporary container for all the the comments on a photo.
      userProfile:        Array, temporary container for all the data of all user's who commented.
      commentsArray:      Array, gets filled with data from allComments and gets returned to frontend.
      usersArray:         Array, get filled with data from userProfile and gets returned to fronted.
*/
// ------------------------------------------------------------------------------
app.post('/show_comments/:imgName', async function(req,res){

  var allComments = new Array();
  var userProfile = new Array();

  var commentsArray = new Array();
  var usersArray = new Array();

  await Pics.find({"img.imgName":req.params.imgName}, async function(err,imgDocs){

    if(imgDocs[0].comments.length == 0)
    {
      return;
    }

    function getComments()
    {
      return new Promise(function(resolve,reject){

          for (var i = 0; i < imgDocs[0].comments.length; i++) {
            allComments.push(imgDocs[0].comments[i]);
            }

        resolve(allComments);
      });
    }


    function getUsers(commentsArray)
    {

      return new Promise(async function(resolve,reject){

        for (var i = 0; i < commentsArray.length; i++) {
          await Users.find({username:commentsArray[i].username}, function(err,docs){
             if(!userProfile.includes(docs[0].username))
             {
               userProfile.push(docs[0]);
             }

           });
         }
         //resolve is happening too soon so timeout was added;
         //there is a timeout because async was not working -> resolve occured before for loop finished
         setTimeout(()=>{resolve(userProfile);},2);

      });
    }

    commentsArray = await getComments();
    usersArray = await getUsers(commentsArray);

    res.json({allComments:commentsArray,
          userProfile:usersArray,
          commentsExist: true});

    });
});

// ------------------------------------------------------------------------------
// Definition: follow_page is the page of the user who correspong to the searchID.
//             This page contains a follow button and all information realting to the searched user
//             This function populates the follow_page.ejs with a specific user's data
// Variables:
//   id:        The id of the current logged on user
//   searchID:  The id of the user who has been searched
//   docs:      All data which is associated with the searchID
//   sFollow:   The string for the button -> Either "Follow" or "Unfollow"
//
//   NOTE: req.params.id gets the id coming from the url (:id)
//         req.params.searchID get the searchID from the url (:searhID)
//
// ------------------------------------------------------------------------------
app.get('/follow_page/:id/:searchID',function(req,res){

  User.findById(req.params.searchID,function(error,docs){
    if (error) return handleError(error);
    Pics.find({ownerID:req.params.searchID}, function(error,imgDocs){
    //Check to see if user already follows the person, if he does then display Unfollow
    var sFollow = "Follow";
    var userID = req.params.id;
    var isfoundID = (docs.followers.includes(userID));

    //the searchID user does not have any followers
    if(docs.followers.length != 0)
    {
      if(isfoundID)
      {
        sFollow = "Unfollow";
      }
    }

    res.render('follow_page',{ id:req.params.id,
                                searchID:req.params.searchID,
                                username:docs.username,
                                followers:docs.followers.length,
                                following:docs.following.length,
                                sFollow: sFollow,
                                bio:docs.bio,
                                imgData:imgDocs,
                                backgroundImg:docs.backgroundImg[0],
                                backgroundColor:docs.backgroundColor[0],
                                profilePicture:docs.profilePic});
  });
});
});
// ------------------------------------------------------------------------------
/*  app.post('/follow_page/:id/:searchID/:follow')

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
app.post('/follow_page/:id/:searchID',function(req,res){

  //------------------------ Update database ----------------------------
  //Manipulate userID from 'followers' in searhID-user DB

  User.findById({_id:req.params.searchID},function(error,docs){
    if(!docs.followers.includes(req.params.id))
    {
      //Add users to the followers in the DB
      User.findOneAndUpdate({_id:req.params.searchID},{$push: {followers: req.params.id}}, {new: true},function (error, followersDoc) {
          saved(error,followersDoc);
          res.json({sNbFollowers:followersDoc.followers.length,
                    bIsFollowing:true});
      });
      //Add users to the following in the DB
      User.findOneAndUpdate({_id:req.params.id},{$push: {following: req.params.searchID}}, {new: true},function (error, followingDoc) {
          saved(error,followingDoc);
      });
    }
    else {
      //Delete users from the followers in the DB
      User.findOneAndUpdate({_id:req.params.searchID},{$pull: {followers: req.params.id}}, {new: true},function (error, followersDoc) {
          saved(error,followersDoc);
          res.json({sNbFollowers:followersDoc.followers.length,
                    bIsFollowing:false});
      });
      //Delete users to the following in the DB
      User.findOneAndUpdate({_id:req.params.id},{$pull: {following: req.params.searchID}}, {new: true},function (error, followingDoc) {
          saved(error,followingDoc);
      });
    }
  });
});

//------------------------------------------------------------------

function saved(error,success)
{
    if (error) {
        console.log(error);
    } else {
        //console.log(success);
    }
}
// ------------------------------------------------------------------------------
/*  app.post('/leaveComment/:id/:username/:searchID/:imgName')

    Definition: Pushed comment into the array of comments for a given picture

                searchID user: The user that was looked up.
                user id:       The logged on user (main).
                imgName:       Name of the file accessed

    Variables:
      searchDocs: query of user DB.
*/
// ------------------------------------------------------------------------------
//This is where the current user can leave a comment
app.post('/leaveComment/:id/:username/:imgOwnerId/:imgName',function(req,res){
  User.findById(req.params.id, function (error, searchDocs){

    var isPosted = false;

    Pics.findOneAndUpdate({"img.imgName":req.params.imgName},
      {$push: {comments: {username:searchDocs.username,comment:req.body.comment}}},
      {new:true},
      async function (error, imgDocs) {
          saved(error,imgDocs);
          isPosted = true;
          await res.json({isPosted:isPosted,
                    totalComments:imgDocs.comments.length,
                    userProfilePic:searchDocs.profilePic});
      });
  });
});

//displays my image in a better view
app.get('/focused_myimage/:id/:imgName',function(req,res)
{



  Users.findById(req.params.id,function(error,docs){
    Pics.find({"img.imgName":req.params.imgName}, function(error,imgDocs){

      Users.findById(imgDocs[0].ownerID,function(err,imgData)
      {
        res.render('focused_myimage',{ id:req.params.id,
                                    username:docs.username,
                                    followers:docs.followers.length,
                                    following:docs.following.length,
                                    bio:docs.bio,
                                    imgData:imgDocs,
                                    profilePicture:imgData.profilePic
                                  });
      });
    });
  });
});
//displays somebody's picture in a better view
app.get('/focused_image/:id/:searchID/:imgName',function(req,res)
{
  Users.findById(req.params.searchID,function(error,searchDocs){ //gets the user were looking at

  Users.findById(req.params.id,function(error,docs){
  Pics.find({"img.imgName":req.params.imgName}, function(error,imgDocs){

    res.render('focused_image',{ id:req.params.id,
                                  username:searchDocs.username,
                                  followers:searchDocs.followers.length,
                                  following:searchDocs.following.length,
                                  bio:searchDocs.bio,
                                  searchID:req.params.searchID,
                                  imgData:imgDocs
                                });
                              });
                            });
                          });
});
// ------------------------------------------------------------------------------
/*  app.post('/like_photo/:id/:imgName/:searchID')

    Definition: Pushes a like into the array of likes for a given picture

                user id:       The logged on user (main).
                imgName:       Name of the file accessed

    Variables:
      imgDocs: query of Pics DB.
*/
// ------------------------------------------------------------------------------
//This is where the current user can like a photo
app.post('/like_photo/:id/:imgName/:imgOwnerID', async function(req,res){
  Pics.find({"img.imgName":req.params.imgName}, function(error,imgDocs){

    if(imgDocs[0].likes.includes(req.params.id))
    {
      Pics.findOneAndUpdate({"img.imgName":req.params.imgName},{$pull: {likes: req.params.id}}, {new: true}, function (error, doc) {
          saved(error,doc);
          res.json({likes:doc.likes.length,
                    bLiked:false});
      });
    }
    else {
      Pics.findOneAndUpdate({"img.imgName":req.params.imgName},{$push: {likes: req.params.id}}, {new: true}, function (error, doc) {
          saved(error,doc);
          res.json({likes:doc.likes.length,
                    bLiked:true});
        });
    }
  });
});

// ------------------------------------------------------------------------------
/*  app.post('/Edit_Profile/:id')

    Definition: Pushes bio into the bio array

                user id:       The logged on user (main).

    Variables:
      req.body.bio yields the bio text inputted from the form.
*/
// ------------------------------------------------------------------------------
//This is where the current user can edit their profile

app.post('/edit_profile/:id',function(req,res){
  Users.findOneAndUpdate({_id:req.params.id},{$set: {bio: req.body.bio}},{new: true},function (error, docs) {
      saved(error,docs);
      res.json({sBio:docs.bio});
  });
});

app.get('/myfollowers_list/:id',function(req,res){

  Users.findById(req.params.id,function(error,docs){
    Pics.find({ownerID:req.params.id}, function(error,imgDocs){
      Users.find({following:req.params.id},function(error, allUsersDocs){
        res.render('myfollowers_list',{ id:req.params.id,
                                      username:docs.username,
                                      totalFollowers:docs.followers,
                                      UsersInfo:allUsersDocs,
                                      followers:docs.followers.length,
                                      following:docs.following.length,
                                      bio:docs.bio,
                                      imgData:imgDocs,
                                      profilePicture:docs.profilePic
                                    });
                                  });
    });
  });
});
app.get('/followers_list/:id/:searchID',function(req,res){

  Users.findById(req.params.searchID,function(error,docs){
    Pics.find({ownerID:req.params.searchID}, function(error,imgDocs){
      Users.find({following:req.params.searchID},function(error, allUsersDocs){
      res.render('Followers_List',{ id:req.params.id,
                                    username:docs.username,
                                    totalFollowers:docs.followers,
                                    searchID:req.params.searchID,
                                    UsersInfo:allUsersDocs,
                                    followers:docs.followers.length,
                                    following:docs.following.length,
                                    bio:docs.bio,
                                    imgData:imgDocs,
                                    profilePicture:docs.profilePic
                                  });
                                });
    });
  });
});

app.get('/myfollowing_list/:id',function(req,res){

  Users.findById(req.params.id,function(error,docs){
    Pics.find({ownerID:req.params.id}, function(error,imgDocs){
      Users.find({followers:req.params.id},function(error, allUsersDocs){
        res.render('myfollowing_list',{ id:req.params.id,
                                      username:docs.username,
                                      totalFollowing:docs.following,
                                      UsersInfo:allUsersDocs,
                                      followers:docs.followers.length,
                                      following:docs.following.length,
                                      bio:docs.bio,
                                      imgData:imgDocs,
                                      profilePicture:docs.profilePic
                                    });
      });
    });
  });
});
app.get('/following_list/:id/:searchID',function(req,res){

  Users.findById(req.params.searchID,function(error,docs){
    Pics.find({ownerID:req.params.searchID}, function(error,imgDocs){
      Users.find({followers:req.params.searchID},function(error, allUsersDocs){
        res.render('Following_List',{ id:req.params.id,
                                      username:docs.username,
                                      totalFollowing:docs.following,
                                      searchID:req.params.searchID,
                                      UsersInfo:allUsersDocs,
                                      followers:docs.followers.length,
                                      following:docs.following.length,
                                      bio:docs.bio,
                                      imgData:imgDocs,
                                      profilePicture:docs.profilePic
                                    });
                                });
    });
  });
});
app.get('/forgot_pass',function(req,res){
  res.render("Forgot_Pass");
});

app.post('/forgot_pass/:Email/:Username', function (req,res) {
  Users.findOne({username:req.params.Username},'username email password',{lean: true}, function(err, docs){
    if (docs==null)
    {
      console.log('Invalid Username or Email');
      res.json({queryExists:false});
    }
    else {
      //Verify that the username and password are correct
      // console.log(docs.username);
      // console.log(req.params.Username);
      //
      // console.log(docs.email[0]);
      // console.log(req.params.Email);


      if((docs.username == req.params.Username) && (docs.email[0] == req.params.Email))
      {
        console.log('Username and Email Correct');
      //  var sId = docs[0]._id;
        // res.redirect('/profile_page/' + sId);
        res.json({queryExists:true,
                  thePass:docs.password});
      }
      else {
        console.log('Incorrect Info');
        res.json({queryExists:false});
      }
    }
  });
});
//Diplsays the get request for a request to edit the profile page
app.get('/edit_profile/:id',function(req,res){
  //findById returns object NOT Array of objects
  User.findById(req.params.id,function(error,docs){
    Pics.find({ownerID:req.params.id}, function(error,imgDocs){
      res.render('profile_edit',{ id:req.params.id,
                                    username:docs.username,
                                    followers:docs.followers.length,
                                    following:docs.following.length,
                                    bio:docs.bio,
                                    imgData:imgDocs
                                  }); //in ejs file do <%=username%>
    });
  });
});
app.get('/edit_background/:id',function(req,res){

  Users.findById(req.params.id,function(error,docs){
    Pics.find({ownerID:req.params.id}, function(error,imgDocs){
      res.render('Edit_Background',{ id:req.params.id,
                                    bio:docs.bio,
                                    username:docs.username,
                                    followers:docs.followers.length,
                                    following:docs.following.length,
                                    profilePicture:docs.profilePic,
                                    backgroundImg:docs.backgroundImg[0],
                                    backgroundColor:docs.backgroundColor[0],
                                    imgData:imgDocs
                                  });
    });
  });
});

app.post('/change_backgroundcolor/:id', function(req,res){
  if (req.body.color!=null)
  {
    User.findOneAndUpdate({_id:req.params.id},{$set: {backgroundColor: req.body.color}},{new: true},function (error, docs) {
        saved(error,docs);
      });
      setTimeout(function()
      {
        res.redirect('/profile_page/'+req.params.id);
      },10);
  }
});

app.post('/upload_background/:id/:currentBackgroundImg',(req, res)=> {
  // console.log(req.file);
  if (req.file!="undefined")
  {
    Users.findById(req.params.id,function(error,docs){
    if (docs.backgroundImg!="bg-masthead.jpg"){
        fs.unlink('public/uploads/'+req.params.currentBackgroundImg, function (err) {
          if (err) throw err;
          console.log("Background image deleted");
        });
    }
  });
    uploadLocal(req,res,(err) => {
      //Callback function with parameter err
      if (err) {
        console.log("Failed to upload to local storage");
      }
      else {
        User.findOneAndUpdate({_id:req.params.id},{$set: {backgroundImg: req.file.filename}},{new: true},function (error, docs) {
            saved(error,docs);
            console.log("Image saved");
            // setTimeout(function()
            // {
            //   res.redirect('/profile_page/'+req.params.id);
            // },100);
            res.redirect('/profile_page/' + req.params.id);
        });
      }
    });
  }
  else {
    res.redirect('/profile_page/'+req.params.id);
  }
});

// ------------------------------------------------------------------------------
/*  date()

    Definition: Returns the date in format year-month-day-hours_minutes_seconds

    Variables:
                date:       The current day.
                month:      The current month.
                year:       The current year.
                hours:      The current hour.
                minutes:    The current minute.
                seconds:    The current second.
*/
// ------------------------------------------------------------------------------


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

  return year + "_" + month + "_" + date + "_" + hours + "_" + minutes + "_" + seconds;
}

//Start Server
// res.render won't do anythng unless listen is called
app.listen(3000, function(){
  console.log("Server started on port 3000...");
});

module.exports = app;
