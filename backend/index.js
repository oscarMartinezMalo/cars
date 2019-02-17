import express from 'express';
import cors from 'cors';
import mysql from 'mysql';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import { check } from 'express-validator/check';
import { validationResult } from 'express-validator/check';
import nodemailer from 'nodemailer';
import { getMaxListeners } from 'cluster';
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
const uuidv1 = require('uuid/v1');
// const nodemailer = require("nodemailer");

const app = express();
app.set('trust proxy', 1);
// Cors is used to modified and receive Cookies, you have to do the request with { withCredentials: true }

// app.use(cors({
//     origin: ['http://localhost:4200'], //the port my react app is running on.
//     //  origin: ['http://getcars.000webhostapp.com'],
//     // origin: ['http://ec2-3-85-90-9.compute-1.amazonaws.com'],
//     credentials: true
// }));

// Allow all Cors
app.use(cors({
    credentials: true,
    origin: true
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
const db = mysql.createConnection({ host: "localhost", user: "root", password: "admin123", database: 'cars' });
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
    // req.session.user ? console.log("Session number " + req.session.user) : console.log("New session");

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
    }
};

// Checks if user is logged in, by checking if user is stored in session.
const PassCheckMiddleware = (req, res, next) => {
    if (req.password && req.session.user) {
        next();
    } else {
        res.status(403).json({ error: { message: "I think que el Current Password No te lo sabes !!!" } });
    }
};

// Pass the middleWare if you wanna ask if the user is logged before executing the request
api.get('/cars/:id', authMiddleware, (req, resp) => {

    // Console log to check if user loggedIn
    // req.session.user ? console.log("Old session") : console.log("New session");
    let id = req.params.id;
    let sql = 'SELECT * FROM  `cars`.`doral-hundai` WHERE  `stock-number` =' + "'" + id + "'";
    let query = db.query(sql, (err, result) => {
        if (err) throw err;
        resp.json(result);
    })
})

auth.post('/login', [
    check('email', "This is not a valid email")
        .isEmail()
        .isLength({ max: 50 })
        .normalizeEmail(),
    check('password', "Password must have 5 Characters")
        .isLength({ min: 5 })
], (req, resp, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return resp.status(422).json({ error: { message: errors.array()[0].msg } });
    }
    console.log(req.body);
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
    check('email', "This is not a valid email")
        .isEmail()
        .isLength({ max: 50 })
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
                db.query('SELECT LAST_INSERT_ID() AS user_id', (error, res, fields) => {
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


    // req.session.destroy(function (err) {
    //     // cannot access session here
    //     if (err) throw err;
    // });
    // You can delete the User session with the code below

    // sessionStore.destroy(req.session.id, (err) => { throw err; });
    req.session.destroy((err) => { if (err) throw err; });
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
        .isLength({ min: 3, max: 15 })
        .not().isEmpty()
        .trim()
        .escape(),
    check('lastName', "Not a valid Last Name")
        .isLength({ min: 3, max: 15 })
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

        db.query(sql, (err, results) => {
            if (err) {
                next(err);
            } else {
                resp.status(200).send({ succeed: "Successfully updated" });

            }
        })
    });

auth.post('/updatePassword', authMiddleware, [
    // Validation the fields comming front the frontend
    check('currentPassword', "Not a valid Current Password")
        .isLength({ min: 3, max: 15 })
        .not().isEmpty()
        .trim()
        .escape(),
    check('newPassword', "Not a valid New Password")
        .isLength({ min: 6, max: 15 })
        .not().isEmpty()
        .trim()
        .escape(),
    check('confirmPassword', "Not a valid New Password")
        .isLength({ min: 6, max: 15 })
        .not().isEmpty()
        .trim()
        .escape()
],
    (req, resp, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return resp.status(422).json({ error: { message: errors.array()[0].msg } });
        }

        let user = req.body;
        // Query to select the salt and hash from the user session
        let sql = 'SELECT `cars`.`users`.`passwordHash`, `cars`.`users`.passwordSalt FROM `cars`.`users` WHERE id =' + "'" + req.session.user + "'";

        db.query(sql, (err, results) => {
            if (err) {
                next(err);
            } else {

                var dbUser = results[0];
                var hashSalt = sha512(user.currentPassword, dbUser.passwordSalt);
                // Checking if the current password is the same as in the dataBase 
                // if is the same  you can update the password with a new one
                if (dbUser.passwordHash == hashSalt.hash) {
                    //Update the password
                    var CurrentSalt = genRandomString(16); /* Gives us salt of length 16 */
                    var CurrentHashSalt = sha512(user.newPassword, CurrentSalt);
                    let sql = 'UPDATE `cars`.`users` SET passwordSalt = ' + "'" + CurrentHashSalt.salt + "'" + ', passwordHash= ' + "'" + CurrentHashSalt.hash + "'" + ' WHERE  id =' + "'" + req.session.user + "' and passwordHash =" + "'" + dbUser.passwordHash + "'";
                    db.query(sql, (error, res) => {
                        if (error) {
                            next(error);
                        }
                        else {
                            resp.json({ succeed: "Password Successfully updated" });
                        }
                    })
                }
                else {
                    const error = new Error("Uhh Ohh Incorrect Current password");
                    error.status = 409;
                    next(error);
                }

            }
        })
    });

// Pass the middleWare if you wanna ask if the user is logged before executing the request
auth.get('/getUserInfo', authMiddleware,
    (req, resp) => {

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

auth.post('/resetpasswordEmail', [
    check('email', "This is not a valid email")
        .isEmail()
        .normalizeEmail()
],
    (req, resp, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return resp.status(422).json({ error: { message: errors.array()[0].msg } });
        }

        var user = req.body;
        let sql = 'SELECT * FROM `cars`.`users` WHERE email ="' + user.email + '"';

        db.query(sql, (err, user) => {
            if (err) {
                next(err);
            } else {

                if (!user.length) {
                    const error = new Error("Buajaja email not registered");
                    error.status = 409;
                    next(error);
                }
                else {
                    sendTokenEmail(user[0], req);
                    // destroy the session so is removed from the response
                    req.session = null;
                    resp.json({ succeed: "Check your email to reset Password" });
                }
            }
        })
    });

function sendTokenEmail(user, req) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'yasiel.cu@gmail.com', // generated ethereal user
            pass: 'Hola1hola' // generated ethereal password
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Cars 👻" <yasiel.cu@gmail.com>', // sender address
        to: user.email, // list of receivers
        subject: "Reset Cars Password ✔", // Subject line
        text: "Hello world?", // plain text body
        html: `<b>Click on the link to reset the password</b>
        <br>
        <b>http://localhost:4200/resetpass/${req.session.id}</b>` // html body
    };

    // Send mail with defined transport object
    transporter.sendMail(mailOptions)
    req.session.user = user.id;
    req.session.save(function (err) {
        // session saved
    })
}

auth.post('/forgotPassword', [
    // Validation the fields comming front the frontend
    check('newPassword', "Not a valid New Password")
        .isLength({ min: 6, max: 15 })
        .not().isEmpty()
        .trim()
        .escape(),
    check('confirmPassword', "Not a valid New Password")
        .isLength({ min: 6, max: 15 })
        .not().isEmpty()
        .trim()
        .escape(),
    check('token', "Something went wrong ")
        .not().isEmpty()
        .trim()
        .escape()
],
    (req, resp, next) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return resp.status(422).json({ error: { message: errors.array()[0].msg } });
        }

        let userForm = req.body;
        let tokenClientSide = userForm.token;
        // Query to select the salt and hash from the user session
        let sql = 'SELECT `cars`.`sessions`.`data` FROM `cars`.`sessions` WHERE session_id =' + "'" + tokenClientSide + "'";

        db.query(sql, (err, results) => {
            if (err) {
                next(err);
            } else {
                if (!results.length) {
                    const error = new Error("The time to reset the password expired");
                    error.status = 409;
                    next(error);
                } else {
                    // delete the session from the DB
                    sessionStore.destroy(tokenClientSide, (error)=>{});
                    let userId = JSON.parse(results[0].data).user;
                    updatePasswordById(userId, userForm.newPassword, resp );
                }

            }
        })
    })

function updatePasswordById(userId, newPassword, resp) {
    var CurrentSalt = genRandomString(16); /* Gives us salt of length 16 */
    var CurrentHashSalt = sha512(newPassword, CurrentSalt);
    let sql = 'UPDATE `cars`.`users` SET passwordSalt = ' + "'" + CurrentHashSalt.salt + "'" + ', passwordHash= ' + "'" + CurrentHashSalt.hash + "'" + ' WHERE  id =' + "'" + userId + "'";
    db.query(sql, (error, res) => {
        if (error) {
            next(error);
        }
        else {
            
            resp.json({ succeed: "Password Successfully updated" });
        }
    })
}

app.use('/api', api)
app.use('/auth', auth)

// Validation Block
app.use((req, resp, next) => {
    const error = new Error("Not Found");
    error.status = 404;
    next(error);
})

app.use((error, req, resp, next) => {
    // console.log(error.message);
    resp.status(error.status || 500).json({ error: { message: error.message } });
});

app.listen(3000, () => console.log("CarsProject"));

