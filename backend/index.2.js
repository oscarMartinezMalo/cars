import express from 'express';
// import cars from './data/carsData1.json';
import mysql from 'mysql';
import bodyParser from 'body-parser';
import jsonwebtoken from 'jsonwebtoken';
import crypto from 'crypto';

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
    let sql = 'SELECT * FROM `cars`.`users` WHERE email ="' + user.email + '"';

    db.query(sql, (err, results) => {
        if (err) throw err;

        if (!results.length)
            sendAuthError(res); /* Error if didn't find any user with that email */
        else {
            let dbUser = results[0];
                // ** Hashing using jsonwebtoken
                //var token = jsonwebtoken.sign(user.password, dbUser.salt);
            var hashSalt = sha512(user.password, dbUser.passwordSalt);

            //var token = jsonwebtoken.sign('qw', '123');
            if (dbUser.passwordHash == hashSalt.hash)
                sendToken(dbUser, res, hashSalt.hash);
            else
                sendAuthError(res);
        }
    })
})

auth.post('/signup', jsonParser, (req, res) => {

    // validate fields before saved
    // Errors responds handlers
    var user = req.body;

    var salt = genRandomString(16); /** Gives us salt of length 16 */
    var hashSalt = sha512(user.password, salt);

    // ** Hashing using jsonwebtoken
    //var token = jsonwebtoken.sign(user.password, 'salt');

    let sql = 'INSERT INTO `cars`.`users` (firstName,lastName,email,passwordSalt,passwordHash) VALUES(' + mysql.escape(user.firstName) + ',' + mysql.escape(user.lastName) + ',' + mysql.escape(user.email) + ',' + mysql.escape(hashSalt.salt) + ',' + mysql.escape(hashSalt.hash) + ')';
    db.query(sql, (err, results) => {
        if (err) throw err;
        //(this have to be change)The second parameter is a secret that should be get from a configuration file
        sendToken(user, res, hashSalt.hash);
    })
})

// Response the user plus Token
function sendToken(user, res, token) {
    res.json({ firstName: user.email, token: token });
}

function sendAuthError(res) {
    return res.json({ success: false, message: 'Email or Password Incorrect' });
}

// ** Generate Salt
function genRandomString(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
}

// ** Hashing the password along with salt
function sha512(password, salt){
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        hash:value
    };
};



app.use('/api', api)
app.use('/auth', auth)

app.listen(3000, () => console.log("cars"));

