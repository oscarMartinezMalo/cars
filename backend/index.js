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
const paypal = require('paypal-rest-sdk');

// const nodemailer = require("nodemailer");

const app = express();

app.set('trust proxy', 1);
// var BASE_URL = 'https://vehicleparty.com';
var BASE_URL = 'http://localhost:4200/';
// var BASE_URL = 'http://vehicleparty.com/';
// Cors is used to modified and receive Cookies, you have to do the request with { withCredentials: true }

// app.use(cors({
// origin: ['http://localhost:4200'], //the port my angular app is running on.
//  origin: ['http://getcars.000webhostapp.com'],
//     origin: ['http://ec2-3-95-160-125.compute-1.amazonaws.com'],
//             credentials: true
// }));

// app.use((req, resp, next) => {
//     //resp.header("Access-Control-Allow-Origin", "http://localhost:4200");
//     resp.header("Access-Control-Allow-Headers", "Origin, X-Requested-Width, Content-Type, Accept");
//     next();
// });

// Allow all Cors
app.use(cors({
    credentials: true,
    origin: true
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var api = express.Router();
var auth = express.Router();

// Create Connection to mysql
const db = mysql.createConnection({ host: "localhost", user: "root", password: "admin123", database: 'cars' });
var sessionStore = new MySQLStore({}, db);
app.use(session({
    genid: function (req) {
        return genuuid() // use UUIDs for session IDs
    },
    secret: '9TLONk4c642Fx7WtxGLSovicjBV9dhCITiUop8_xUu0og7hKGfx9Dx5vkNMNGDFQ',
    store: sessionStore,    // This set the session storage to the dataBase, by default the sessions are storage in memory not recomended in production
    resave: false,
    // rolling: true; //Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown.
    saveUninitialized: false, //If is false is not gonna persist in the dataBase
    cookie: { maxAge: 60 * 60 * 1000 } // 60000 is one minute
}))

//Function to generate a new session ID
function genuuid() { return uuidv1(); };

db.connect(err => {
    if (err) throw err;
    console.log("Connected!");
})
// 
// api.get('/cars', (req, resp) => {

// Console log to check is user loggedIn
// req.session.user ? console.log("Session number " + req.session.user) : console.log("New session");

//Select all the cars from the cars DB
//     let sql = 'SELECT * FROM `cars`.`doral-hundai`';

//     let query = db.query(sql, (err, results) => {
//         if (err) throw err;
//         resp.json(results);
//     })
// })

api.get('/cars/:page/:perPage/:sortByprice', (req, res) => {

    let perPage = req.params.perPage;
    let pageIndex = req.params.page;
    let sortByprice = req.params.sortByprice;

    let sql = 'SELECT count(*) as totalCars FROM `cars`.`doral-hundai`';

    db.query(sql, (err, resTotal) => {
        if (err) {
            throw err;
        } else {

            let totalRecords = resTotal[0].totalCars;
            let offsetNumber = pageIndex * perPage;
            let sql1 = 'SELECT `stock-number` as stockNumber, `car-name` as carName, `price-difference` as priceDifference, `engine`, `tranmission`, `mpg-range` as mpgRange,`exterior-color` as exteriorColor FROM `cars`.`doral-hundai` order by `internet-price`' + sortByprice + ' limit ' + perPage + ' offset ' + offsetNumber;

            db.query(sql1, (err, records) => {
                if (err) {                    
                    throw err;
                } else {
                    console.log(records[1]);
                    res.status(200).json({ 'total': totalRecords, 'pageIndex': pageIndex, records });
                }
            });

        }
    });

})

// Checks if user is logged in, by checking if user is stored in session.
const authMiddleware = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.status(403).json({  message: "Please login first" });
    }
};

// Checks if user is logged in, by checking if user is stored in session.
const PassCheckMiddleware = (req, res, next) => {
    if (req.password && req.session.user) {
        next();
    } else {
        res.status(403).json({ error: { message: "Current Password incorrect !!!" } });
    }
};

// Pass the middleWare if you wanna ask if the user is logged before executing the request
// api.get('/car/:id', authMiddleware, (req, resp) => {

    api.get('/car', authMiddleware, (req, resp) => {
    let id = req.query.id;
    // Console log to check if user loggedIn
    // req.session.user ? console.log("Old session") : console.log("New session");

    let sql = 'SELECT * FROM  `cars`.`doral-hundai` WHERE  `stock-number` =' + "'" + id + "'";
    let query = db.query(sql, (err, result) => {
        if (err) throw err;

        resp.status(200).json(
            {
                'stockNumber': result[0]['stock-number'],
                'carName': result[0]['car-name'],
                'priceDifference': result[0]['price-difference'],
                'engine': result[0]['engine'],
                'tranmission': result[0]['tranmission'],
                'mpgRange': result[0]['mpg-range'],
                'exteriorColor': result[0]['exterior-color'],
                'pagination2Href': result[0]['pagination2-href']
            });
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

    var user = req.body;
    let sql = 'SELECT * FROM `cars`.`users` WHERE email ="' + user.email + '"';
    // console.log(sql);
    db.query(sql, (err, results) => {
        if (err) {
            next(err);
        } else {

            if (!results.length) {
                /* sendAuthError(res);  Error if didn't find any user with that email */
                //return res.status(422).json({ message: 'Buajaja email registered' });
                const error = new Error("Email not registered");
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
                    const error = new Error("Incorrect password");
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
                db.query('SELECT LAST_INSERT_ID() AS user_id', (error, result, fields) => {
                    if (error) {
                        next(err);
                    } else {
                        if (!result.length) {
                            const error = new Error("Try to login if you can't sign up again");
                            error.status = 409;
                            next(error);
                        } else {
                            let dbUserId = result[0].user_id;
                            req.session.user = dbUserId;    //Create session with user = DatabaseUserID so you can Search by ID when you need it
                            resp.json({ email: user.email });
                        }
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
                if (!results.length) {
                    const error = new Error("Error updating password, user not found");
                    error.status = 409;
                    next(error);
                }
                else {

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
                                // resp.json({ succeed: "Password Successfully updated" });
                                resp.status(200).send({ succeed: "Password Successfully updated" });
                            }
                        })
                    }
                    else {
                        const error = new Error("Incorrect Current password");
                        error.status = 409;
                        next(error);
                    }
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
                    const error = new Error("Email not registered");
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
        }
        //Use this from local host
        // ,
        // tls: {
        //     rejectUnauthorized: false
        // }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Cars 👻" <yasiel.cu@gmail.com>', // sender address
        to: user.email, // list of receivers
        subject: "Reset Cars Password ✔", // Subject line
        text: "This link is gonna expired in 15 minutes", // plain text body
        html: `<b>Click on the link to reset the password</b>
        <br>
        <b>${BASE_URL}/index.html#/resetpass/${req.session.id}</b>`
        // <b>http://ec2-3-95-160-125.compute-1.amazonaws.com/index.html#/resetpass/${req.session.id}</b>`
        // Used in local host
        // <b>http://localhost:4200/resetpass/${req.session.id}</b> // html body
    };

    // Send mail with defined transport object
    transporter.sendMail(mailOptions)
    req.session.user = user.id;
    req.session.cookie.maxAge = 15 * 60 * 1000; // Session is gonna expired in 15 min
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
                    sessionStore.destroy(tokenClientSide, (error) => { });
                    let userId = JSON.parse(results[0].data).user;
                    updatePasswordById(userId, userForm.newPassword, resp);
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


// Paypal
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'ASFFab1yjnV6n-pKnMLfhURx2O7sHUM8wYBfTztwGP0UH4TuTMDjTk0X2G06XjUFcCatr95BMudLYUB-', //App Client ID
    'client_secret': 'EIk0gpDTqIe4E4wuMiOHOG9y0WOp5OAq1R2Ampe3GirlMrUGMueqZk2rlVBY7TD5A4qJG5JnY8pesOe4' //App Client ID
});

app.paymentAmount = "";

auth.post('/pay', authMiddleware, [
    // Validation the fields comming front the frontend
    check('amount', "Not a Valid amount")
        .isNumeric()
        .isInt()
        .isLength({ min: 1, max: 3 })
        .not().isEmpty()
        .trim()
        .escape()
],
    (req, res, next) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return resp.status(422).json({ error: { message: errors.array()[0].msg } });
        }

        let payment = req.body;
        app.paymentAmount = req.body.amount;
        // Fetch data from dataBase example
        // amount = select amount from products where item = payment.item
        //  quantity = payment.quantity
        //  total = amount * quantity;
        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:3000/auth/success",
                "cancel_url": "http://localhost:3000/auth/cancel"
                // Change to this when Express runs in port 80 
                // so apache sever have to change the default port(80) to allow express take the port 80 
                // "return_url": BASE_URL + ":3000/auth/success",
                // "cancel_url": BASE_URL + ":3000/auth/cancel"    
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "Donation",
                        "sku": "Donating dollars",
                        "price": app.paymentAmount,
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": app.paymentAmount
                },
                "description": "Paypal pay"
            }]
        };

        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                throw error;
            } else {
                for (let i = 0; i < payment.links.length; i++) {
                    if (payment.links[i].rel === 'approval_url') {
                        // This open in a same page
                        // res.redirect(payment.links[i].href); 
                        // This open in a new page        
                        res.json({ paypalUrl: payment.links[i].href });
                        // console.log(payment.links[i].href)      
                        // console.log( BASE_URL + ":3000/auth/success" );               
                        // res.redirect(payment.links[i].href); 
                    }
                }
            }
        })
    })

auth.get('/success', (req, res) => {

    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": app.paymentAmount
            }
        }]
    };


    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            //console.log(JSON.stringify(payment));
            // res.send('Success');
            // res.json(JSON.stringify(payment));
            // res.redirect('back');
            // res.redirect('..');
            // res.redirect(BASE_URL);
            // res.send()      

            // 1.- create email with the data receipt the data in insede this variable (payment)
            // 2.- redirect to success page.
            // res.redirect(BASE_URL + "/#/payment/success" );
            res.redirect(BASE_URL + "#/payment/success");
        }
    });

})


auth.get('/cancel', (req, res) => {
    // res.send('Cancelled');
    // res.redirect('http://localhost:4200',400)
    res.redirect(BASE_URL + "#/payment/error", 400);

});

//paypal end

app.use('/api', api)
app.use('/auth', auth)

// Validation Block
app.use((req, resp, next) => {
    const error = new Error("Not  Found");
    error.status = 404;
    next(error);
})

app.use((error, req, resp, next) => {
    // console.log(error.message);
    resp.status(error.status || 500).json({ error: { message: error.message } });
});

app.listen(3000, () => console.log("CarsProject"));
