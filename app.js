require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({
    extended: true
}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/userDB', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model('User', userSchema);

passport.serializeUser(function (user, done) {
    console.log('Serializing user:', user);
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    console.log('Deserializing user with id:', id);
    User.findById(id)
        .then((user) => {
            done(null, user);
        })
        .catch((err) => {
            done(err, null);
        });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    passReqToCallback: true
},
    function (request, accessToken, refreshToken, profile, done) {
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return done(err, user);
        });
    }
));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ['email', 'profile'] }
));

app.get('/auth/google/secrets',
    passport.authenticate('google', {
        successRedirect: '/secrets',
        failureRedirect: '/login'
    }));

app.get("/secrets", function(req, res){
  User.find({"secret": {$ne: null}})
    .then(function(foundUsers){
      if (foundUsers) {
        res.render("secrets", {usersWithSecrets: foundUsers});
      }
    })
    .catch(function(err){
      console.error(err);
    });
});


app.get('/submit', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('submit');
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy(); // Clear the session
    res.redirect('/');
});

app.post("/login", function(req, res){

    const user = new User({
      username: req.body.username,
      password: req.body.password
    });
  
    req.login(user, function(err){
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("/secrets");
        });
      }
    });
  
  });

  app.post("/register", function(req, res){

    User.register({username: req.body.username}, req.body.password, function(err, user){
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("/secrets");
        });
      }
    });
  
  });

app.post('/submit', (req, res) => {
    const submittedSecret = req.body.secret;

    // Check if the user is authenticated either via Google or locally
    if (req.isAuthenticated()) {
        User.findById(req.user.id)
            .then((foundUser) => {
                if (foundUser) {
                    foundUser.secret = submittedSecret;
                    return foundUser.save();
                }
            })
            .then(() => {
                res.redirect('/secrets');
            })
            .catch((err) => {
                console.error(err);
                res.redirect('/submit'); // Redirect to submit page on error
            });
    } else {
        res.redirect('/login');
    }
});

app.listen(3000, () => {
    console.log('Server Running on Port 3000');
});