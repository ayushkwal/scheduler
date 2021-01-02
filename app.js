//installing/requiring modules/files
const express = require('express');
const app = express();
const controller = require('./controllers/authControllers');
const { requireAuth, checkUser } = require('./middleware/authMiddlewares');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
// const requireAuth = require('./controllers/authControllers');
const jwt = require('jsonwebtoken');
// const { checkUser } = require('./middleware/authMiddlewares');

//setting view engine
app.set('view engine', 'ejs');
//statc files
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());




controller(app);
// app.get('*', checkUser);
app.get('/home', requireAuth, (req, res) => {
    res.render('home.ejs');
});

//listen server
app.listen(80, () => {
    console.log('Listening');
});