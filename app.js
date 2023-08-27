const express = require('express')
const ejs = require('ejs')
const exp = require('constants')

const app = express()

app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use(express.urlencoded({
    extended: true
}))

app.listen(3000, () => {
    console.log('Server Running on Port 3000')
})

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/register', (req, res) => {
    res.render('register')
})
