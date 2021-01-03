//installing/requiring modules/files
var bodyParser = require('body-parser');
var urlencodedparser = bodyParser.urlencoded({ extended: false });
const { isEmail } = require('validator');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

//Handling errors
function handleErrors(err) {
    console.log(err);
    console.log(err.message, err.code, 'are msg and codes');
    var errors = { email: '', password: '', connection: '' };
    if (err.code == 11000) { //duplicate emails
        errors.email = 'Email already registerd';
        return errors;
    }
    if (err.message.includes('`details.findOne()` buffering timed out after 10000ms')) {
        console.log('check your connection');
        errors.connection = 'Check your Connectivity';
        return errors;

    }
    if (err.message.includes('`details.insertOne()` buffering timed out after 10000ms')) {
        console.log('check your connection');
        errors.connection = 'Check your Connectivity';
        return errors;

    }
    if (err.message.includes('detail validation failed')) //validated failed
    {
        console.log('------------------------------------------>')
        Object.values(err.errors).forEach(properties => {
            errors[properties.path] = properties.message;
        });
    }
    if (err.message.includes(`Email doesn't exists`)) {
        errors.email = `Email doesn't exists`;
    }
    if (err.message.includes(`Incorrect Password`)) {
        errors.password = `You have Entered Incorrect Password`;
    }
    return errors;
}
//Verification of jwt to protect routes
// module.exports.requireAuth = function requireAuth(req, res, next) {
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

//creating json web token
function createToken(id) {
    //you need 3 things i.e. payload(identify user among billions using id),signature(secret),headers(type of token,its properties)
    return jwt.sign({ id }, 'ayush secret key', { expiresIn: 3 * 24 * 60 * 60 });
}

//mongoose connection
// I hide the password for security purpose.
mongoose.connect('mongodb+srv://ayush:<password>@cluster0.jawu5.mongodb.net/Authentication?retryWrites=true&w=majority');

//creating blueprint of data i.e. Schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please enter an email address'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter valid email address']
    },

    password: {
        type: String,
        required: [true, 'Please enter password'],
        minlength: [6, 'Password should be minimum 6 characters']
    }
});
//using pre and post facilities before or after saving to doc
userSchema.pre('save', async function(next) { //only next will be parameter
    const genSalt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, genSalt);
    console.log('user is going to save to database');
    next();
});

//user schema for logging users
userSchema.statics.login = async function(email, password) {
    const getemail = await this.findOne({ email });
    console.log('finding in db');
    if (getemail) {
        console.log('found in db and check pwd');
        const checkpassword = await bcrypt.compare(password, getemail.password);
        if (checkpassword) {
            console.log('password corect user returned');
            return getemail;
        } else {
            throw Error(`Incorrect Password`);
        }
    } else {
        console.log('no');
        throw Error(`Email doesn't exists`);

    }

}

//there's no need to use userSchema.post but for sake of confirmation you may write this
userSchema.post('save', function(doc, next) { //both doc and next will be parameter bcoz doc is saved now

    console.log('user saved successfuly');
    next();
});

//creating model
// mongoose.model('database name',userSchema);
const data = mongoose.model('detail', userSchema);
module.exports = data;





module.exports = function(app) {
    app.get('/login', function(req, res) {

        res.render('login.ejs');
    });


    app.post('/signup', urlencodedparser, async function(req, res) {
        console.log(req.body);
        // var a = req.body;
        const { email, password } = req.body;
        try {

            const saving = await data.create({ email, password });
            const token = createToken(saving._id); //ID of that with which you are saving  
            res.cookie('jwt', token, { httpOnly: true, maxAge: 3 * 24 * 60 * 60 });
            res.json({ saving: saving._id });
            res.send('saved');
        } catch (err) {
            const errors = handleErrors(err);
            // console.log(err);
            res.json({ errors });
        }
    });
    app.get('/signup', function(req, res) {
        res.render('signup.ejs');
    });



    app.post('/login', urlencodedparser, async function(req, res) {
        console.log(req.body);
        // var a = req.body;
        const { email, password } = req.body;
        try {
            console.log('check123')
            const saving = await data.login(email, password); //saving provides an ID
            const token = createToken(saving._id); //ID of that with which you are saving  
            res.cookie('jwt', token, { httpOnly: true, maxAge: 3 * 24 * 60 * 60 });

            if (saving) {
                console.log('saving._id ')
                res.json({ saving: saving._id });
            } else {
                console.log('kindly connect to Internet');
            }
        } catch (err) {
            // console.log(err);
            const errors = handleErrors(err);
            res.json({ errors });
        }

    });

    //Logout user
    app.get('/logout', function(req, res) {
        res.cookie('jwt', '', { maxAge: 1 });
        res.redirect('/login');
    });

}
