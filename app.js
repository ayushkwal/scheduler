const express = require('express');
const app = express();
const controller = require('./controllers/authControllers');
const { requireAuth, checkUser } = require('./middleware/authMiddlewares');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');

const mysqlConnection = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"password",
    database:"pepping",
    multipleStatements:true
})
mysqlConnection.connect((err)=>{
    if(!err) console.log('connectd');
    else console.log('not connected due to',err);
})

//setting view engine
app.set('view engine', 'ejs');
//statc files
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());




app.post('/submitTeacherSchedule',(req,res)=>{
    console.log('reached here')
    console.log(req.body);
    var mysqldata = `INSERT INTO userdata (teacherName, month, time, meriddian, lectureName,date)
    VALUES ('${req.body.teacherName}',${req.body.month},${req.body.time},'${req.body.meriddian}','${req.body.lectureName}',${req.body.date});`
    mysqlConnection.query(mysqldata,(err,rows,fields)=>{
        if(err){
            console.log(err);
            if(err.code=='ER_DUP_ENTRY') res.json({error:'Already scheduled lecture at this time'})
            else  res.json({error:'Something Went Wrong'})
        }
        else{
            console.log('got it')
            console.log(rows)
            return res.json({success:'Lecture Schedule Successfully'});
        }
    })
})




app.post('/123',(req,res)=>{
    console.log('sending:', req.body.teacherName,req.body.month,req.body.date)
    mysqlConnection.query(`SELECT * FROM userdata WHERE teacherName='${req.body.teacherName}' AND month = ${req.body.month+1} AND date = ${req.body.date} `,(err,rows,fields)=>{
        if(err) {console.log(err); return res.json({error:err})}
        else{
            // res.send(rows)
            console.log('got it')
            console.log(rows)
            return res.json({rows:rows});
        }
    })
})

controller(app);

app.get('/home', (req, res) => {
    res.render('home.ejs');
});
app.get('/setschedule',requireAuth,(req,res)=>{
    res.render('setSchedule.ejs');
})


var port = process.env.PORT || 1337;

//listen server
app.listen(port, () => {
    console.log('Listening');
});