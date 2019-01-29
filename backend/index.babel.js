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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var uuidv1 = require('uuid/v1');

var app = (0, _express2.default)();
app.set('trust proxy', 1);
// Cors is used to modified and receive Cookies, you have to do the request with { withCredentials: true }

app.use((0, _cors2.default)({
    // origin: ['http://localhost:4200'], //the port my react app is running on.
    // origin: ['http://getcars.000webhostapp.com'],
    origin: ['http://ec2-3-85-90-9.compute-1.amazonaws.com'],
    credentials: true
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
    secret: 'asdasdasd',
    store: sessionStore, // this set the session storage to the dataBase, by default the sessions are storage in memory not recomended in production
    resave: false,
    saveUninitialized: false, //If is false is not gonna persist in the dataBase
    cookie: { maxAge: 60000 // 60000 is one minute
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
        res.status(403).json({ error: { message: "I think que el Current Password No te lo sabes !!!" } });
    }
};

// Pass the middleWare if you wanna ask if the user is logged before executing the request
api.get('/cars/:id', authMiddleware, function (req, resp) {

    // Console log to check is user loggedIn
    // req.session.user ? console.log("Old session") : console.log("New session");
    var id = req.params.id;
    var sql = 'SELECT * FROM  `cars`.`doral-hundai` WHERE  `stock-number` =' + "'" + id + "'";
    var query = db.query(sql, function (err, result) {
        if (err) throw err;
        resp.json(result);
    });
});

auth.post('/login', [(0, _check.check)('email', "This is not a valid email").isEmail().normalizeEmail(), (0, _check.check)('password', "Password must have 5 Characters").isLength({ min: 5 })], function (req, resp, next) {

    var errors = (0, _check.validationResult)(req);
    if (!errors.isEmpty()) {
        return resp.status(422).json({ error: { message: errors.array()[0].msg } });
    }
    var user = req.body;
    var sql = 'SELECT * FROM `cars`.`users` WHERE email ="' + user.email + '"';

    db.query(sql, function (err, results) {
        if (err) {
            next(err);
        } else {

            if (!results.length) {
                /* sendAuthError(res);  Error if didn't find any user with that email */
                //return res.status(422).json({ message: 'Buajaja email registered' });
                var error = new Error("Buajaja email not registered");
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
                    var _error = new Error("Uhh Ohh Incorrect password");
                    _error.status = 409;
                    next(_error);
                }
            }
        }
    });
});

auth.post('/signup', [
// Validating fields comming front the frontend
(0, _check.check)('firstName', "Not a valid First Name").isLength({ min: 3, max: 15 }).trim().escape(), (0, _check.check)('lastName', "Not a valid Last Name").isLength({ min: 3, max: 15 }).not().isEmpty().trim().escape(), (0, _check.check)('email', "This is not a valid email").isEmail().isLength({ max: 15 }).normalizeEmail(), (0, _check.check)('email').custom(function (value) {
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
            db.query('SELECT LAST_INSERT_ID() AS user_id', function (error, res, fields) {
                if (error) {
                    next(err);
                } else {
                    var dbUserId = res[0].user_id;
                    req.session.user = dbUserId; //Create session with user = DatabaseUserID so you can Search by ID when you need it
                    resp.json({ email: user.email });
                }
            });
        }
    });
});

auth.post('/logout', function (req, res) {

    req.session.destroy(function (err) {
        // cannot access session here
        if (err) throw err;
    });
    // You can delete the User session with the code below
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

auth.post('/updatePassword', authMiddleware, [
// Validation the fields comming front the frontend
(0, _check.check)('currentPassword', "Not a valid Current Password").isLength({ min: 3, max: 15 }).not().isEmpty().trim().escape(), (0, _check.check)('newPassword', "Not a valid New Password").isLength({ min: 3, max: 15 }).not().isEmpty().trim().escape(), (0, _check.check)('confirmPassword', "Not a valid New Password").isLength({ min: 3, max: 15 }).not().isEmpty().trim().escape()], function (req, resp, next) {
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

            var dbUser = results[0];
            var hashSalt = sha512(user.currentPassword, dbUser.passwordSalt);

            if (dbUser.passwordHash == hashSalt.hash) {
                //Update the password
                var CurrentSalt = genRandomString(16); /* Gives us salt of length 16 */
                var CurrentHashSalt = sha512(user.newPassword, CurrentSalt);
                var _sql = 'UPDATE `cars`.`users` SET passwordSalt = ' + "'" + CurrentHashSalt.salt + "'" + ', passwordHash= ' + "'" + CurrentHashSalt.hash + "'" + ' WHERE  id =' + "'" + req.session.user + "' and passwordHash =" + "'" + dbUser.passwordHash + "'";
                db.query(_sql, function (error, res) {
                    if (error) {
                        next(error);
                    } else {
                        resp.json({ succeed: "Password Successfully updated" });
                    }
                });
            } else {
                var error = new Error("Uhh Ohh Incorrect Current password");
                error.status = 409;
                next(error);
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

app.use('/api', api);
app.use('/auth', auth);

// Validation Block
app.use(function (req, resp, next) {
    var error = new Error("Not Found");
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
