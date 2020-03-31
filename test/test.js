const assert = require("chai").assert;
const app = require("../app");

const request = require("supertest");
const expect = require("chai").expect;

const MONGODB_URI =
  "mongodb+srv://soen341:soen341@clustersoen341-bbtjh.mongodb.net/UserData?retryWrites=true&w=majority";

describe("LOGIN TEST", function() {
  it("correct credentials", done => {
    request(app)
      .post("/login_page/rkc/123")
      .then(res => {
        const body = res.body;
        //console.log(body);
        expect(body.bExists).to.equal(true);
        done();
      });
  });

  it("incorrect credentials", done => {
    request(app)
      .post("/login_page/rkc/456")
      .then(res => {
        const body = res.body;
        //console.log(body);
        expect(body.bExists).to.equal(false);
        done();
      });
  });
});
