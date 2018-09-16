import express from 'express';
// import cars from './data/carsData1.json';
import mysql from 'mysql';
import bodyParser from 'body-parser';
import jsonwebtoken from 'jsonwebtoken';

// Create Connection 
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "admin123",
    database: 'CARS'
});

db.connect(err => {
    if (err) throw err;
    console.log("Connected!");
})


const app = express()
var jsonParser = bodyParser.json()

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-Width, Content-Type,Accept");
    next();
})


var api = express.Router();
var auth = express.Router();

api.get('/cars', (req, res) => {
    // res.json(cars);
    let sql = 'SELECT * FROM `cars`.`doral-hundai`';
    let query = db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    })
})

api.get('/cars/:id', (req, res) => {
    var id = req.params.id;
    let sql = 'SELECT * FROM  `cars`.`doral-hundai` WHERE  `stock-number` =' + "'" + id + "'";
    console.log(sql);
    let query = db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.json(result);
    })
})

auth.post('/login', jsonParser, (req, res) => {
    var user = req.body;
    let sql = 'SELECT * FROM `cars`.`users` WHERE email ="' + user.email +'"';

    db.query(sql, (err, results) => {
        if (err) throw err;

        if (!results.length)
            sendAuthError(res);
        else {
            var token = jsonwebtoken.sign(user.password, '123');
            //var token = jsonwebtoken.sign('qw', '123');
             if (results[0].passwordSalt == token)             
                sendToken(results[0], res, token);
            else
                sendAuthError(res);
        }
    })
})

auth.post('/register', jsonParser, (req, res) => {
    // Encrypt the password before saved
    // validate fields before saved
    // Errors responds handlers
    var user = req.body;
    //Temporary hash and salt
    // let passwordSalt = user.password;
    var token = jsonwebtoken.sign(user.password, '123');
    let passwordSalt = token;
    let passwordHash = user.password;
    let sql = 'INSERT INTO `cars`.`users` (firstName,lastName,email,passwordSalt,passwordHash) VALUES(' + mysql.escape(user.firstName) + ',' + mysql.escape(user.lastName) + ',' + mysql.escape(user.email) + ',' + mysql.escape(passwordSalt) + ',' + mysql.escape(passwordHash) + ')';
    console.log(sql);
    db.query(sql, (err, results) => {
        if (err) throw err;
        //(this have to be change)The second parameter is a secret that should be get from a configuration file
        sendToken(user, res, token);
    })
})

function sendToken(user, res, token) {
    res.json({ firstName: user.firstName, token: token });
}

// function sendToken(user, res, resultID) {
//     var token = jsonwebtoken.sign(resultID, '123');
//     res.json({ firstName: user.firstName, token: token });
// }

function sendAuthError(res) {
    console.log("error");
    return res.json({ success: false, message: 'Email or Password Incorrect' });
}

app.use('/api', api)
app.use('/auth', auth)

app.listen(3000, () => console.log("cars"));

