const assert = require("chai").assert;
const app = require("../app");

const request = require("supertest");
const expect = require("chai").expect;

const MONGODB_URI =
  "mongodb+srv://soen341:soen341@clustersoen341-bbtjh.mongodb.net/UserData?retryWrites=true&w=majority";

describe("LOGIN TEST", function() {
  it("correct credentials", done => {
    request(app)
      .post("/login_page/test/test")
      .then(res => {
        const body = res.body;
        //console.log(body);
        expect(body.bExists).to.equal(true);
        done();
      });
  });

  it("incorrect credentials", done => {
    request(app)
      .post("/login_page/test/wrong")
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
    done();
  });
});

describe("LIKE TEST", function() {
  it("upload photo", done => {
    done();
  });
});

describe("COMMENT TEST", function() {
  it("leave a comment", done => {
    done();
  });
});

describe("DELETE PHOTO TEST", function() {
  it("remove photo", done => {
    done();
  });
});

describe("FOLLOW TEST", function() {
  it("follow a user", done => {
    request(app)
      .post("/follow_page/5e84149dde6be044e854a069/5e7e99e636863928902668e5")
      .then(res => {
        const body = res.body;
        // console.log(body);
        expect(body.bIsFollowing).to.equal(true);
        done();
      });
  });

  it("unfollow a user", done => {
    request(app)
      .post("/follow_page/5e84149dde6be044e854a069/5e7e99e636863928902668e5")
      .then(res => {
        const body = res.body;
        //console.log(body);
        expect(body.bIsFollowing).to.equal(false);
        done();
      });
  });
});
