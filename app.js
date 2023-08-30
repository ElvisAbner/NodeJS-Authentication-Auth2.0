require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();
const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({
    extended: true
}));
}));

app.listen(3000, () => {
    console.log('Server Running on Port 3000');
});

mongoose.connect('mongodb://localhost:27017/userDB', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
 
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']})

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
    res.render('home');
});
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save()
        .then(() => {
            res.render('secrets');
        })
        .catch((err) => {
            console.log(err);
        });
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}).then((foundUser) => {
        if (foundUser) {
            if (foundUser.password === password) {
                res.render('secrets');
            }
        }
    }).catch((err) => {
        console.log(err)
    })
    res.render('register');
});

app.post('/register', (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save()
        .then(() => {
            res.render('secrets');
        })
        .catch((err) => {
            console.log(err);
        });
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}).then((foundUser) => {
        if (foundUser) {
            if (foundUser.password === password) {
                res.render('secrets');
            }
        }
    }).catch((err) => {
        console.log(err)
    })
})
