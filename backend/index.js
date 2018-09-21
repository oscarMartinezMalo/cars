import express from 'express';
// import cars from './data/carsData1.json';
import mysql from 'mysql';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import { check } from 'express-validator/check';
import { validationResult } from 'express-validator/check';
// import { promises } from 'fs';
// import { morgan } from 'morgan';

const app = express()
//const jsonParser = bodyParser.json()
// Error using Morgan
// app.use(morgan('combined'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-Width, Content-Type, Accept");
    next();
})

var api = express.Router();
var auth = express.Router();

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

api.get('/cars', (req, res) => {
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

auth.post('/login', [
    check('email', "This is not a valid email").isEmail()
        .normalizeEmail(),
    check('password', "Password must have 5 Characters").isLength({ min: 5 })
], (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ error: {message: errors.array()[0].msg }});
    }

    var user = req.body;
    let sql = 'SELECT * FROM `cars`.`users` WHERE email ="' + user.email + '"';

    db.query(sql, (err, results) => {
        if (err) {
             next(err);
        } else {

            if (!results.length) {
                /* sendAuthError(res);  Error if didn't find any user with that email */
                //return res.status(422).json({ message: 'Buajaja email registered' });
                const error = new Error("Buajaja email not registered");
                error.status = 409;
                next(error);
            }
            else {
                let dbUser = results[0];

                var hashSalt = sha512(user.password, dbUser.passwordSalt);

                if (dbUser.passwordHash == hashSalt.hash) {
                    sendToken(dbUser, res, hashSalt.hash);
                }
                else {
                    // res.status(422).json({ message: 'Incorrect password' });
                    const error = new Error("Ohh Uhh Incorrect password");
                    error.status = 409;
                    next(error);
                }
            }
        }
    })
})

auth.post('/signup', [
    // Validation the fields comming front the frontend
    check('firstName', "Not a valid First Name")
        .isLength({ min: 3 })
        .trim()
        .escape(),
    check('lastName', "Not a valid Last Name")
        .isLength({ min: 3 })
        .not().isEmpty()
        .trim()
        .escape(),
    check('email', "This is not a valid email").isEmail()
        .normalizeEmail(),
    check('email').custom(value => {
        return findUserByEmail(value).then(user => {
            return true;
        })
    }),
    check('password', "Password must have 5 Characters").isLength({ min: 5 }),
    check('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        } else
            return true;
    })
],
    (req, res, next) => {
        const errors = validationResult(req);
        console.log(errors.array());
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: {message: errors.array()[0].msg }});
        }
        // If there is no any Error continue and created a new User
        let user = req.body;
        var salt = genRandomString(16); /* Gives us salt of length 16 */
        var hashSalt = sha512(user.password, salt);

        let sql = 'INSERT INTO `cars`.`users` (firstName,lastName,email,passwordSalt,passwordHash) VALUES(' + mysql.escape(user.firstName) + ',' + mysql.escape(user.lastName) + ',' + mysql.escape(user.email) + ',' + mysql.escape(hashSalt.salt) + ',' + mysql.escape(hashSalt.hash) + ')';
        db.query(sql, (err, results) => {
            if (err) {
                next(err);
            } else {
                sendToken(user, res, hashSalt.hash);
            }
        })

    });


function findUserByEmail(email) {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM `cars`.`users` WHERE email ="' + email + '"';
        db.query(sql, (err, results) => {
            if (err) reject("Error connecting to DataBase");

            if (!results.length) {
                resolve();
            }
            else {
                reject("User taken");
            }
        })
    })

}

// Response the user plus Token
function sendToken(user, res, token) {
    res.json({ firstName: user.email, token: token });
}

// ** Generate Salt
function genRandomString(length) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex') /** convert to hexadecimal format */
        .slice(0, length);   /** return required number of characters */
}

// ** Hashing the password along with salt
function sha512(password, salt) {
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt: salt,
        hash: value
    };
};

app.use('/api', api)
app.use('/auth', auth)

app.use((req, res, next) => {
    const error = new Error("Not Found");
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    console.log(error.message);
    res.status(error.status || 500).json({ error: { message: error.message } });
});

app.listen(3000, () => console.log("cars"));

