//installing/requiring modules/files
const express = require('express');
const app = express();
const controller = require('./controllers/authControllers');
const { requireAuth } = require('./middleware/authMiddlewares');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
// const requireAuth = require('./controllers/authControllers');
const jwt = require('jsonwebtoken');

//setting view engine
app.set('view engine', 'ejs');
//statc files
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
// function requireAuth(req, res, next) {
//     const token = req.cookies.jwt;
//     if (token) {
//         const verify = jwt.verify(token, 'ayush secret key', function(err, decodeToken) {
//             if (verify) {
//                 next();
//             } else {
//                 res.redirect('/login');
//             }
//         })

//     } else {
//         res.redirect('/login');
//     }
// }

//calling controller
controller(app);
app.get('/home', requireAuth, (req, res) => {
    res.render('home.ejs');
});

//listen server
app.listen(80, () => {
    console.log('Listening');
});