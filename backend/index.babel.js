'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _mysql = require('mysql');

var _mysql2 = _interopRequireDefault(_mysql);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _check = require('express-validator/check');

var _nodemailer = require('nodemailer');

var _nodemailer2 = _interopRequireDefault(_nodemailer);

var _cluster = require('cluster');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var uuidv1 = require('uuid/v1');
var paypal = require('paypal-rest-sdk');
// const nodemailer = require("nodemailer");

var app = (0, _express2.default)();
app.set('trust proxy', 1);
// Cors is used to modified and receive Cookies, you have to do the request with { withCredentials: true }

// app.use(cors({
// origin: ['http://localhost:4200'], //the port my react app is running on.
//  origin: ['http://getcars.000webhostapp.com'],
//    origin: ['http://ec2-3-95-160-125.compute-1.amazonaws.com'],
// credentials: true
// }));

// Allow all Cors
app.use((0, _cors2.default)({
    credentials: true,
    origin: true
}));

app.use(_bodyParser2.default.urlencoded({ extended: false }));
app.use(_bodyParser2.default.json());

// app.use((req, resp, next) => {
//     //resp.header("Access-Control-Allow-Origin", "http://localhost:4200");
//     resp.header("Access-Control-Allow-Headers", "Origin, X-Requested-Width, Content-Type, Accept");
//     next();
// });


var api = _express2.default.Router();
var auth = _express2.default.Router();

// Create Connection to mysql
var db = _mysql2.default.createConnection({ host: "localhost", user: "root", password: "admin123", database: 'cars' });
var sessionStore = new MySQLStore({}, db);
app.use(session({
    genid: function genid(req) {
        return genuuid(); // use UUIDs for session IDs
    },
    secret: '9TLONk4c642Fx7WtxGLSovicjBV9dhCITiUop8_xUu0og7hKGfx9Dx5vkNMNGDFQ',
    store: sessionStore, // this set the session storage to the dataBase, by default the sessions are storage in memory not recomended in production
    resave: false,
    // rolling: true; //Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown.
    saveUninitialized: false, //If is false is not gonna persist in the dataBase
    cookie: { maxAge: 60 * 60 * 1000 // 60000 is one minute
    } }));

//Function to generate a new session ID
function genuuid() {
    return uuidv1();
};

db.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

api.get('/cars', function (req, resp) {

    // Console log to check is user loggedIn
    // req.session.user ? console.log("Session number " + req.session.user) : console.log("New session");

    //Select all the cars from the cars DB
    var sql = 'SELECT * FROM `cars`.`doral-hundai`';
    var query = db.query(sql, function (err, results) {
        if (err) throw err;
        resp.json(results);
    });
});

// Checks if user is logged in, by checking if user is stored in session.
var authMiddleware = function authMiddleware(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.status(403).json({ error: { message: "You have to be logged to see beyond the walls" } });
    }
};

// Checks if user is logged in, by checking if user is stored in session.
var PassCheckMiddleware = function PassCheckMiddleware(req, res, next) {
    if (req.password && req.session.user) {
        next();
    } else {
        res.status(403).json({ error: { message: "Current Password incorrect !!!" } });
    }
};

// Pass the middleWare if you wanna ask if the user is logged before executing the request
api.get('/cars/:id', authMiddleware, function (req, resp) {

    // Console log to check if user loggedIn
    // req.session.user ? console.log("Old session") : console.log("New session");
    var id = req.params.id;
    var sql = 'SELECT * FROM  `cars`.`doral-hundai` WHERE  `stock-number` =' + "'" + id + "'";
    var query = db.query(sql, function (err, result) {
        if (err) throw err;
        resp.json(result);
    });
});

auth.post('/login', [(0, _check.check)('email', "This is not a valid email").isEmail().isLength({ max: 50 }).normalizeEmail(), (0, _check.check)('password', "Password must have 5 Characters").isLength({ min: 5 })], function (req, resp, next) {

    var errors = (0, _check.validationResult)(req);
    if (!errors.isEmpty()) {
        return resp.status(422).json({ error: { message: errors.array()[0].msg } });
    }

    var user = req.body;
    var sql = 'SELECT * FROM `cars`.`users` WHERE email ="' + user.email + '"';
    console.log(sql);
    db.query(sql, function (err, results) {
        if (err) {
            next(err);
        } else {

            if (!results.length) {
                /* sendAuthError(res);  Error if didn't find any user with that email */
                //return res.status(422).json({ message: 'Buajaja email registered' });
                var error = new Error("Email not registered");
                error.status = 409;
                next(error);
            } else {

                var dbUser = results[0];
                var hashSalt = sha512(user.password, dbUser.passwordSalt);

                if (dbUser.passwordHash == hashSalt.hash) {
                    req.session.user = dbUser.id;
                    resp.json({ email: user.email });
                } else {
                    // resp.status(422).json({ message: 'Incorrect password' });
                    var _error = new Error("Incorrect password");
                    _error.status = 409;
                    next(_error);
                }
            }
        }
    });
});

auth.post('/signup', [
// Validating fields comming front the frontend
(0, _check.check)('firstName', "Not a valid First Name").isLength({ min: 3, max: 15 }).trim().escape(), (0, _check.check)('lastName', "Not a valid Last Name").isLength({ min: 3, max: 15 }).not().isEmpty().trim().escape(), (0, _check.check)('email', "This is not a valid email").isEmail().isLength({ max: 50 }).normalizeEmail(), (0, _check.check)('email').custom(function (value) {
    return findUserByEmail(value).then(function (user) {
        return true;
    });
}), (0, _check.check)('password', "Password must have 5 Characters").isLength({ min: 3, max: 15 }), (0, _check.check)('confirmPassword').isLength({ min: 3, max: 15 }).custom(function (value, _ref) {
    var req = _ref.req;

    if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
    } else return true;
})], function (req, resp, next) {
    var errors = (0, _check.validationResult)(req);
    if (!errors.isEmpty()) {
        return resp.status(422).json({ error: { message: errors.array()[0].msg } });
    }
    // If there is no any Error continue and created a new User
    var user = req.body;
    var salt = genRandomString(16); /* Gives us salt of length 16 */
    var hashSalt = sha512(user.password, salt);

    var sql = 'INSERT INTO `cars`.`users` (firstName,lastName,email,passwordSalt,passwordHash) VALUES(' + _mysql2.default.escape(user.firstName) + ',' + _mysql2.default.escape(user.lastName) + ',' + _mysql2.default.escape(user.email) + ',' + _mysql2.default.escape(hashSalt.salt) + ',' + _mysql2.default.escape(hashSalt.hash) + ')';
    db.query(sql, function (err, results) {
        if (err) {
            next(err);
        } else {
            db.query('SELECT LAST_INSERT_ID() AS user_id', function (error, result, fields) {
                if (error) {
                    next(err);
                } else {
                    if (!result.length) {
                        var _error2 = new Error("Try to login if you can't sign up again");
                        _error2.status = 409;
                        next(_error2);
                    } else {
                        var dbUserId = result[0].user_id;
                        req.session.user = dbUserId; //Create session with user = DatabaseUserID so you can Search by ID when you need it
                        resp.json({ email: user.email });
                    }
                }
            });
        }
    });
});

auth.post('/logout', function (req, res) {
    // req.session.destroy(function (err) {
    //     // cannot access session here
    //     if (err) throw err;
    // });
    // You can delete the User session with the code below

    // sessionStore.destroy(req.session.id, (err) => { throw err; });
    req.session.destroy(function (err) {
        if (err) throw err;
    });
    // sessionStore.destroy("dgmnoMlC0SlOZDlTJuLeiuRSzYG1S0FO",(error)=>{});

    res.status(200).send({});
});

function findUserByEmail(email) {
    return new Promise(function (resolve, reject) {
        var sql = 'SELECT * FROM `cars`.`users` WHERE email ="' + email + '"';
        db.query(sql, function (err, results) {
            if (err) reject("Error connecting to DataBase");

            if (!results.length) {
                resolve();
            } else {
                reject("User taken");
            }
        });
    });
}

auth.post('/updateName', authMiddleware, [
// Validation the fields comming front the frontend
(0, _check.check)('firstName', "Not a valid First Name").isLength({ min: 3, max: 15 }).not().isEmpty().trim().escape(), (0, _check.check)('lastName', "Not a valid Last Name").isLength({ min: 3, max: 15 }).not().isEmpty().trim().escape()], function (req, resp, next) {
    var errors = (0, _check.validationResult)(req);

    if (!errors.isEmpty()) {
        return resp.status(422).json({ error: { message: errors.array()[0].msg } });
    }

    // If there is no any Error continue and Update the  User
    var user = req.body;
    var sql = 'UPDATE `cars`.`users` SET firstName = ' + "'" + user.firstName + "'" + ', lastName= ' + "'" + user.lastName + "'" + ' WHERE  id =' + "'" + req.session.user + "'";

    db.query(sql, function (err, results) {
        if (err) {
            next(err);
        } else {
            resp.status(200).send({ succeed: "Successfully updated" });
        }
    });
});

auth.post('/updatePassword', authMiddleware, PassCheckMiddleware, [
// Validation the fields comming front the frontend
(0, _check.check)('currentPassword', "Not a valid Current Password").isLength({ min: 3, max: 15 }).not().isEmpty().trim().escape(), (0, _check.check)('newPassword', "Not a valid New Password").isLength({ min: 6, max: 15 }).not().isEmpty().trim().escape(), (0, _check.check)('confirmPassword', "Not a valid New Password").isLength({ min: 6, max: 15 }).not().isEmpty().trim().escape()], function (req, resp, next) {
    var errors = (0, _check.validationResult)(req);

    if (!errors.isEmpty()) {
        return resp.status(422).json({ error: { message: errors.array()[0].msg } });
    }

    var user = req.body;
    // Query to select the salt and hash from the user session
    var sql = 'SELECT `cars`.`users`.`passwordHash`, `cars`.`users`.passwordSalt FROM `cars`.`users` WHERE id =' + "'" + req.session.user + "'";

    db.query(sql, function (err, results) {
        if (err) {
            next(err);
        } else {
            if (!results.length) {
                var error = new Error("Error updating password, user not found");
                error.status = 409;
                next(error);
            } else {

                var dbUser = results[0];
                var hashSalt = sha512(user.currentPassword, dbUser.passwordSalt);
                // Checking if the current password is the same as in the dataBase 
                // if is the same  you can update the password with a new one
                if (dbUser.passwordHash == hashSalt.hash) {
                    //Update the password
                    var CurrentSalt = genRandomString(16); /* Gives us salt of length 16 */
                    var CurrentHashSalt = sha512(user.newPassword, CurrentSalt);
                    var _sql = 'UPDATE `cars`.`users` SET passwordSalt = ' + "'" + CurrentHashSalt.salt + "'" + ', passwordHash= ' + "'" + CurrentHashSalt.hash + "'" + ' WHERE  id =' + "'" + req.session.user + "' and passwordHash =" + "'" + dbUser.passwordHash + "'";
                    db.query(_sql, function (error, res) {
                        if (error) {
                            next(error);
                        } else {
                            // resp.json({ succeed: "Password Successfully updated" });
                            resp.status(200).send({ succeed: "Password Successfully updated" });
                        }
                    });
                } else {
                    var _error3 = new Error("Incorrect Current password");
                    _error3.status = 409;
                    next(_error3);
                }
            }
        }
    });
});

// Pass the middleWare if you wanna ask if the user is logged before executing the request
auth.get('/getUserInfo', authMiddleware, function (req, resp) {

    var sql = 'SELECT `users`.`firstName`, `users`.`lastName` FROM  `cars`.`users` WHERE  `id` =' + "'" + req.session.user + "'";
    var query = db.query(sql, function (err, result) {
        if (err) throw err;
        resp.json(result);
    });
});

// ** Generate Salt
function genRandomString(length) {
    return _crypto2.default.randomBytes(Math.ceil(length / 2)).toString('hex') /** convert to hexadecimal format */
    .slice(0, length); /** return required number of characters */
}

// ** Hashing the password along with salt
function sha512(password, salt) {
    var hash = _crypto2.default.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt: salt,
        hash: value
    };
};

auth.post('/resetpasswordEmail', [(0, _check.check)('email', "This is not a valid email").isEmail().normalizeEmail()], function (req, resp, next) {
    var errors = (0, _check.validationResult)(req);
    if (!errors.isEmpty()) {
        return resp.status(422).json({ error: { message: errors.array()[0].msg } });
    }

    var user = req.body;
    var sql = 'SELECT * FROM `cars`.`users` WHERE email ="' + user.email + '"';

    db.query(sql, function (err, user) {
        if (err) {
            next(err);
        } else {

            if (!user.length) {
                var error = new Error("Email not registered");
                error.status = 409;
                next(error);
            } else {
                sendTokenEmail(user[0], req);
                // destroy the session so is removed from the response
                req.session = null;
                resp.json({ succeed: "Check your email to reset Password" });
            }
        }
    });
});

function sendTokenEmail(user, req) {
    var transporter = _nodemailer2.default.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'yasiel.cu@gmail.com', // generated ethereal user
            pass: 'Hola1hola' // generated ethereal password

            //Use this from local host
            // ,
            // tls: {
            //     rejectUnauthorized: false
            // }
        } });

    // setup email data with unicode symbols
    var mailOptions = {
        from: '"Cars 👻" <yasiel.cu@gmail.com>', // sender address
        to: user.email, // list of receivers
        subject: "Reset Cars Password ✔", // Subject line
        text: "This link is gonna expired in 15 minutes", // plain text body
        html: '<b>Click on the link to reset the password</b>\n        <br>\n        <b>http://ec2-3-95-160-125.compute-1.amazonaws.com/index.html#/resetpass/' + req.session.id + '</b>'
        // Used in local host
        // <b>http://localhost:4200/resetpass/${req.session.id}</b> // html body
    };

    // Send mail with defined transport object
    transporter.sendMail(mailOptions);
    req.session.user = user.id;
    req.session.cookie.maxAge = 15 * 60 * 1000; // Session is gonna expired in 15 min
    req.session.save(function (err) {
        // session saved
    });
}

auth.post('/forgotPassword', [
// Validation the fields comming front the frontend
(0, _check.check)('newPassword', "Not a valid New Password").isLength({ min: 6, max: 15 }).not().isEmpty().trim().escape(), (0, _check.check)('confirmPassword', "Not a valid New Password").isLength({ min: 6, max: 15 }).not().isEmpty().trim().escape(), (0, _check.check)('token', "Something went wrong ").not().isEmpty().trim().escape()], function (req, resp, next) {

    var errors = (0, _check.validationResult)(req);

    if (!errors.isEmpty()) {
        return resp.status(422).json({ error: { message: errors.array()[0].msg } });
    }

    var userForm = req.body;
    var tokenClientSide = userForm.token;
    // Query to select the salt and hash from the user session
    var sql = 'SELECT `cars`.`sessions`.`data` FROM `cars`.`sessions` WHERE session_id =' + "'" + tokenClientSide + "'";

    db.query(sql, function (err, results) {
        if (err) {
            next(err);
        } else {
            if (!results.length) {
                var error = new Error("The time to reset the password expired");
                error.status = 409;
                next(error);
            } else {
                // delete the session from the DB
                sessionStore.destroy(tokenClientSide, function (error) {});
                var userId = JSON.parse(results[0].data).user;
                updatePasswordById(userId, userForm.newPassword, resp);
            }
        }
    });
});

function updatePasswordById(userId, newPassword, resp) {
    var CurrentSalt = genRandomString(16); /* Gives us salt of length 16 */
    var CurrentHashSalt = sha512(newPassword, CurrentSalt);
    var sql = 'UPDATE `cars`.`users` SET passwordSalt = ' + "'" + CurrentHashSalt.salt + "'" + ', passwordHash= ' + "'" + CurrentHashSalt.hash + "'" + ' WHERE  id =' + "'" + userId + "'";
    db.query(sql, function (error, res) {
        if (error) {
            next(error);
        } else {

            resp.json({ succeed: "Password Successfully updated" });
        }
    });
}

// Paypal
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'ASFFab1yjnV6n-pKnMLfhURx2O7sHUM8wYBfTztwGP0UH4TuTMDjTk0X2G06XjUFcCatr95BMudLYUB-', //App Client ID
    'client_secret': 'EIk0gpDTqIe4E4wuMiOHOG9y0WOp5OAq1R2Ampe3GirlMrUGMueqZk2rlVBY7TD5A4qJG5JnY8pesOe4' //App Client ID
});

auth.post('/pay', function (req, res) {
    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/auth/success",
            "cancel_url": "http://localhost:3000/auth/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Red Sox Hat",
                    "sku": "item",
                    "price": "25.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "25.00"
            },
            "description": "Paypal pay"
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for (var i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    // res.redirect(payment.links[i].href); 
                    res.json({ paypalUrl: payment.links[i].href });
                    // let url = payment.links[i].href ;             
                }
            }
        }
    });
});

auth.get('/success', function (req, res) {
    // let id = req.params.id;
    var payerId = req.query.PayerID;
    var paymentId = req.query.paymentId;

    var execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "25.00"
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            // console.log(JSON.stringify(payment));
            // res.send('Success');
            res.redirect('http://vehicleparty.com');
        }
    });
});

auth.get('/cancel', function (req, res) {
    // res.send('Cancelled');
    // res.redirect('http://localhost:4200',400)
    res.redirect('http://vehicleparty.com', 400);
});

//paypal end


app.use('/api', api);
app.use('/auth', auth);

// Validation Block
app.use(function (req, resp, next) {
    var error = new Error("Not  Found");
    error.status = 404;
    next(error);
});

app.use(function (error, req, resp, next) {
    // console.log(error.message);
    resp.status(error.status || 500).json({ error: { message: error.message } });
});

app.listen(3000, function () {
    return console.log("CarsProject");
});
