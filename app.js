//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "Your secret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("DATABASE_URI", {
  useNewUrlParser: true,
  useUnifiedTopology: true})
        .then(connect => console.log('connected to mongodb'))
        .catch(e => console.log('could not connect to mongodb', e));

const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});


app.get("/", (req, res) => {
  res.render("index");
});


app.get("/logout", (req, res) => {
  req.logout();
  res.status(200).send();
});

app.post("/register",(req, res) =>{

  User.register({username: req.body.username}, req.body.password, (err, user) => {
    if (err) {
      res.send(err);
    } else {
      passport.authenticate("local")(req, res, () =>{
        res.status(200).send();
      });
    }
  });

});

app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      res.send(err);
    } else {
      passport.authenticate("local")(req, res, () => {
        res.status(200).send();
      });
    }
  });

});

app.get("/test", (req, res) => {
  if(req.user){
    res.status(200).send();
  } else {
    res.status(403).send();
  }
});


app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
