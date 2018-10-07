import express from 'express';
import cors from 'cors';
import mysql from 'mysql';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import { check } from 'express-validator/check';
import { validationResult } from 'express-validator/check';
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
const uuidv1 = require('uuid/v1');

const app = express();
app.set('trust proxy', 1);
// Cors is used to modifie and receive Cookies, you have to do the request with { withCredentials: true }

app.use(cors({
    origin: ['http://localhost:4200'], //the port my react app is running on.
    credentials: true
}));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.use((req, resp, next) => {
//     //resp.header("Access-Control-Allow-Origin", "http://localhost:4200");
//     resp.header("Access-Control-Allow-Headers", "Origin, X-Requested-Width, Content-Type, Accept");
//     next();
// });

var api = express.Router();
var auth = express.Router();

// Create Connection to mysql
const db = mysql.createConnection({ host: "localhost", user: "root", password: "admin123", database: 'CARS' });
var sessionStore = new MySQLStore({}, db);
app.use(session({
    genid: function (req) {
        return genuuid() // use UUIDs for session IDs
    },
    secret: 'asdasdasd',
    store: sessionStore,    // this set the session storage to the dataBase, by default the sessions are storage in memory not recomended in production
    resave: false,
    saveUninitialized: false, //If is false is not gonna persist in the dataBase
    cookie: { maxAge: 60000 } // 60000 is one minute
}))

//Function to generate a new session ID
function genuuid() { return uuidv1(); };

db.connect(err => {
    if (err) throw err;
    console.log("Connected!");
})

api.get('/cars', (req, resp) => {

    // Console log to check is user loggedIn
    req.session.user ? console.log("Session number " + req.session.user) : console.log("New session");

    //Select all the cars from the cars DB
    let sql = 'SELECT * FROM `cars`.`doral-hundai`';
    let query = db.query(sql, (err, results) => {
        if (err) throw err;
        resp.json(results);
    })
})

// Checks if user is logged in, by checking if user is stored in session.
const authMiddleware = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.status(403).json({ error: { message: "You have to be logged to see beyond the walls" } });
        //next( new Error('You have to be logged to see it'));
    }
};

// Pass the middleWare if you wanna ask if the user is logged before executing the request
api.get('/cars/:id', authMiddleware, (req, resp) => {

    // Console log to check is user loggedIn
    req.session.user ? console.log("Old session") : console.log("New session");

    let id = req.params.id;
    let sql = 'SELECT * FROM  `cars`.`doral-hundai` WHERE  `stock-number` =' + "'" + id + "'";
    let query = db.query(sql, (err, result) => {
        if (err) throw err;
        resp.json(result);
    })
})

auth.post('/login', [
    check('email', "This is not a valid email").isEmail()
        .normalizeEmail(),
    check('password', "Password must have 5 Characters").isLength({ min: 5 })
], (req, resp, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return resp.status(422).json({ error: { message: errors.array()[0].msg } });
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

                var dbUser = results[0];
                var hashSalt = sha512(user.password, dbUser.passwordSalt);

                if (dbUser.passwordHash == hashSalt.hash) {
                    req.session.user = dbUser.id;
                    resp.json({ email: user.email });
                }
                else {
                    // resp.status(422).json({ message: 'Incorrect password' });
                    const error = new Error("Uhh Ohh Incorrect password");
                    error.status = 409;
                    next(error);
                }
            }
        }
    })
})


auth.post('/signup', [
    // Validating fields comming front the frontend
    check('firstName', "Not a valid First Name")
        .isLength({ min: 3, max: 15 })
        .trim()
        .escape(),
    check('lastName', "Not a valid Last Name")
        .isLength({ min: 3, max: 15 })
        .not().isEmpty()
        .trim()
        .escape(),
    check('email', "This is not a valid email").isEmail()
        .isLength({ max: 15 })
        .normalizeEmail(),
    check('email')
        .custom(value => {
            return findUserByEmail(value).then(user => {
                return true;
            })
        }),
    check('password', "Password must have 5 Characters")
        .isLength({ min: 3, max: 15 }),
    check('confirmPassword')
        .isLength({ min: 3, max: 15 })
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Password confirmation does not match password');
            } else
                return true;
        })
],
    (req, resp, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return resp.status(422).json({ error: { message: errors.array()[0].msg } });
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
                db.query('SELECT LAST_INSERT_ID() AS user_id', function (error, res, fields) {
                    if (error) {
                        next(err);
                    } else {
                        let dbUserId = res[0].user_id;
                        req.session.user = dbUserId;    //Create session with user = DatabaseUserID so you can Search by ID when you need it
                        resp.json({ email: user.email });
                    }
                });

            }
        })

    });

auth.post('/logout', (req, res) => {

    req.session.destroy(function (err) {
        // cannot access session here
        if (err) throw err;
    });
    // You can delete the User session with the code below
    // sessionStore.destroy("dgmnoMlC0SlOZDlTJuLeiuRSzYG1S0FO",(error)=>{});
    res.status(200).send({});
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


auth.post('/updateName', authMiddleware, [
    // Validation the fields comming front the frontend
    check('firstName', "Not a valid First Name")
        .isLength({ min: 3 })
        .trim()
        .escape(),
    check('lastName', "Not a valid Last Name")
        .isLength({ min: 3 })
        .not().isEmpty()
        .trim()
        .escape()
],
    (req, resp, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return resp.status(422).json({ error: { message: errors.array()[0].msg } });
        }

        // If there is no any Error continue and Update the  User
        let user = req.body;
        let sql = 'UPDATE `cars`.`users` SET firstName = ' + "'" + user.firstName + "'" + ', lastName= ' + "'" + user.lastName + "'" + ' WHERE  id =' + "'" + req.session.user + "'";
        console.log(sql);
        db.query(sql, (err, results) => {
            if (err) {
                next(err);
            } else {
                resp.status(200).send({ success: "Ok" });

            }
        })

    });


// Pass the middleWare if you wanna ask if the user is logged before executing the request
auth.get('/getUserInfo', authMiddleware, (req, resp) => {
    console.log(req.session.user);
    let sql = 'SELECT `users`.`firstName`, `users`.`lastName` FROM  `cars`.`users` WHERE  `id` =' + "'" + req.session.user + "'";
    let query = db.query(sql, (err, result) => {
        if (err) throw err;
        resp.json(result);
    })
})









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

// Validation Block
app.use((req, resp, next) => {
    const error = new Error("Not Found");
    error.status = 404;
    next(error);
})

app.use((error, req, resp, next) => {
    console.log(error.message);
    resp.status(error.status || 500).json({ error: { message: error.message } });
});

app.listen(3000, () => console.log("cars"));

