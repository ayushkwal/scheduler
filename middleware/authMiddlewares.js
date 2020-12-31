const jwt = require('jsonwebtoken');

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
}
module.exports = { requireAuth };