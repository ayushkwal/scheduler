const jwt = require('jsonwebtoken');
const data = require('../controllers/authControllers');
const mongoose = require('mongoose');

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        console.log('token found')
        jwt.verify(token, 'ayush secret key', function(err, decodedToken) {
            if (err) {
                res.redirect('/login');
            } else {
                next();
            }
        })
    } else {
        res.redirect('/login');
    }
};

const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, 'ayush secret key', async(err, decodedToken) => {
            if (err) {
                res.locals.userid = 'hello';
                next();

            } else {
                console.log(decodedToken.id);
                let user = await data.findById(decodedToken.id);
                console.log(user);
                res.locals.userid = 'hello';
                next();
            }
        });
    } else {
        res.locals.userid = null;
        next();
    }
}


module.exports = { requireAuth, checkUser };