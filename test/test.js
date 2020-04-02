const app = require("../app");
const request = require("supertest");
const expect = require("chai").expect;

const MONGODB_URI =
  "mongodb+srv://soen341:soen341@clustersoen341-bbtjh.mongodb.net/UserData?retryWrites=true&w=majority";
const username = "test";
const userID = "5e860748b1aa663a547f7a49";
const password = "test";

var imgname;

describe("LOGIN TEST", function() {
  it("correct credentials", done => {
    request(app)
      .post("/login_page/" + username + "/" + password)
      .then(res => {
        const body = res.body;
        //console.log(body);
        expect(body.bExists).to.equal(true);
        done();
      });
  });

  it("incorrect credentials", done => {
    request(app)
      .post("/login_page/" + username + "/wrong")
      .then(res => {
        const body = res.body;
        //console.log(body);
        expect(body.bExists).to.equal(false);
        done();
      });
  });
});

describe("POST PHOTO TEST", function() {
  it("upload photo", done => {
    imgname = date() + "demo-image-01.jpg";
    request(app)
      .post("/upload/" + userID)
      .attach("file", "front_end/img/demo-image-01.jpg")
      .end(function(err, res) {
        done();
      });
  });
});

describe("LIKE TEST", function() {
  it("like photo", done => {
    request(app)
      .post("/like_photo/" + username + "/" + imgname + "/" + username)
      .then(res => {
        const body = res.body;
        //console.log(body);
        expect(body.likes).to.equal(1);
        done();
      });
  });
});

describe("COMMENT TEST", function() {
  it("leave a comment", done => {
    request(app)
      .post(
        "/leaveComment/" +
          userID +
          "/" +
          username +
          "/" +
          userID +
          "/" +
          imgname
      )
      .send({ comment: "testing" })
      .then(res => {
        const body = res.body;
        //console.log(body);
        expect(body.isPosted).to.equal(true);
        done();
      });
  });
});

describe("DELETE PHOTO TEST", function() {
  it("remove photo", done => {
    request(app)
      .post("/delete_photo/" + imgname)
      .then(res => {
        const body = res.body;
        //console.log(body);
        expect(body.bDeleted).to.equal(true);
        done();
      });
  });
});

describe("FOLLOW TEST", function() {
  it("follow a user", done => {
    request(app)
      .post("/follow_page/" + userID + "/5e7e99e636863928902668e5")
      .then(res => {
        const body = res.body;
        // console.log(body);
        expect(body.bIsFollowing).to.equal(true);
        done();
      });
  });

  it("unfollow a user", done => {
    request(app)
      .post("/follow_page/" + userID + "/5e7e99e636863928902668e5")
      .then(res => {
        const body = res.body;
        //console.log(body);
        expect(body.bIsFollowing).to.equal(false);
        done();
      });
  });
});

function date() {
  let dateObj = new Date();
  // current date
  let date = ("0" + dateObj.getDate()).slice(-2);
  let month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
  let year = dateObj.getFullYear();
  let hours = dateObj.getHours();
  let minutes = dateObj.getMinutes();
  let seconds = dateObj.getSeconds();

  return (
    year +
    "-" +
    month +
    "-" +
    date +
    "-" +
    hours +
    "_" +
    minutes +
    "_" +
    seconds
  );
}
