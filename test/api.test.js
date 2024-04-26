import chai from "chai";
import chaiHttp from "chai-http";
import { describe, it } from "mocha";
import app from "../app.js";

chai.use(chaiHttp);

const BASE_URL = "api";
const CURRENT_VERSION = "v1";

describe("api test", () => {
  let basicUserToken;
  let adminUserToken;
  it("should register user", (done) => {
    chai
      .request(app)
      .post(`/${BASE_URL}/${CURRENT_VERSION}/auth/register`)
      .send({
        id: 3, // Change this id after seeding basic and admin users
        firstName: "Test",
        lastName: "User",
        username: "testuser",
        email: "test.user@op.ac.nz",
        profilePicture:
          "https://api.dicebear.com/6.x/pixel-art/svg?seed=testuser",
        password: "P@ssw0rd123",
        confirmPassword: "P@ssw0rd123",
        role: "BASIC_USER",
      })
      .end((err, res) => {
        chai.expect(res.body.msg).to.be.equal("User successfully registered");
        basicUserToken = res.body.token;
        done();
      });
  });

  it("should login an admin user using their email & password", (done) => {
    chai
      .request(app)
      .post(`/${BASE_URL}/${CURRENT_VERSION}/auth/login`)
      .send({
        username: "josephhong",
        password: "P@ssw0rd123",
      })
      .end((err, res) => {
        chai
          .expect(res.body.msg)
          .to.be.equal("josephhong successfully logged in");
        done();
      });
  });

  // Before the creating quiz test, login as an admin user
  before((done) => {
    chai
      .request(app)
      .post(`/${BASE_URL}/${CURRENT_VERSION}/auth/login`)
      .send({
        username: "josephhong",
        password: "P@ssw0rd123",
      })
      .end((err, res) => {
        chai
          .expect(res.body.msg)
          .to.be.equal("josephhong successfully logged in");
        adminUserToken = res.body.token;
        done();
      });
  });

  // Make sure categories data are seeded before this test or it will cause errors
  it("should create a quiz", (done) => {
    chai
      .request(app)
      .post(`/${BASE_URL}/${CURRENT_VERSION}/quizzes/seed`)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send({
        name: "Test quiz",
        categoryId: 9,
        type: "multiple",
        difficulty: "easy",
        startDate: "21/06/2023",
        endDate: "23/06/2023",
      })
      .end((err, res) => {
        chai.expect(res.body.msg).to.be.equal("Quiz successfully created");
        done();
      });
  });

  // Before the participation test, login as an basic user
  before((done) => {
    chai
      .request(app)
      .post(`/${BASE_URL}/${CURRENT_VERSION}/auth/login`)
      .send({
        username: "testuser",
        password: "P@ssw0rd123",
      })
      .end((err, res) => {
        chai
          .expect(res.body.msg)
          .to.be.equal("testuser successfully logged in");
        basicUserToken = res.body.token;
        done();
      });
  });

  it("should participate in an quiz", (done) => {
    chai
      .request(app)
      .post(`/${BASE_URL}/${CURRENT_VERSION}/quizzes/participate/3`) // this id can be subjected to change depending on the quiz id
      .set("Authorization", `Bearer ${basicUserToken}`)
      .send({
        // change answers for each quiz so tests passes
        answers: [
          "HTC",
          "Watch",
          "Bearings",
          "Thomas Jefferson",
          "Hubble Space Telescope",
          "Ben Shapiro",
          "Malala Yousafzai",
          "poisson",
          "Joseph Fry",
          "Mario Tennis 64 (N64)",
        ],
      })
      .end((err, res) => {
        chai
          .expect(res.body.msg)
          .to.be.equal("testuser has successfully participated in Test quiz");
        done();
      });
  });
});
