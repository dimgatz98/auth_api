require('dotenv').config();

const moment = require('moment')

const bcrypt = require('bcryptjs');

const bodyParser = require("body-parser");

const express = require('express');
const jwt = require('jsonwebtoken');

const {createPool} = require('mysql');
const { DATETIME } = require('mysql/lib/protocol/constants/types');
const { json } = require('express/lib/response');

const pool = createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    connectionLimit: 10
});

const app = express();

const waitDays = process.env.DAYS || 2;
const port = process.env.PORT || 3333;
const db = process.env.DB;

app.use(bodyParser.json());

app.get('/api', (req, res) => {
    res.json({
        message: "Welcome to the API"
    });
});

app.post('/api/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if(!validateEmail(email) ) {
        res.sendStatus(403);
    } else {
        pool.query(`select * from ${db}.users where AcademicEmail = ?`, [email], (err, user) => {
            if (err) throw err;

            const verified = bcrypt.compareSync(password, user[0].Password)

            if (!verified) {
                res.sendStatus(403);
            } else {
                jwt.sign({user}, process.env.SECRET_KEY, { expiresIn: '7d' }, (err, token) => {
                    if (err) throw err;

                    res.json({
                        token
                    });
                });
            }
        });
    }
});

app.post('/api/datetime/set', verifyTokenMiddleware, (req, res) => {

    jwt.verify(req.token, process.env.SECRET_KEY, (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            const datetime = req.body.datetime;

            if (!validateDatetime(datetime) || !isTwoDaysLater(datetime)) {
                res.sendStatus(403);
            } else {
                pool.query(`select * from ${db}.schedule where datetime=?`, [datetime], (err, result) => {
                    if (err) throw err;

                    if (result.length > 0) {
                        res.json({
                            message: "Duplicate entry"
                        });
                    } else {
                        pool.query(`insert into ${db}.schedule (user_id, datetime) values (?, ?)`, [authData.user[0].id, datetime], (err) => {
                            if (err) throw err;

                            res.json({
                                message: "Datetime reserved"
                            });
                        });
                    }
                });
            }
        }
    });
});

app.get('/api/start', verifyTokenMiddleware, (req, res) => {
    jwt.verify(req.token, process.env.SECRET_KEY, (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            const user_id = authData.user[0].id;
            pool.query(`select * from ${db}.schedule where user_id=? and datetime=?`, [user_id, nullifyMinsAndSecs(moment().format('YYYY-MM-D hh:mm:ss'))], (err, result) => {
                if (result.length > 0) {
                    res.json({
                        message: "You're in"
                    });
                } else {
                    res.sendStatus(403);
                }
            });
        }
    });
});

// TOKEN FORMAT
// Authorization: Bearer <access_token>
function verifyTokenMiddleware(req, res, next) {
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== "undefined") {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        // Forbidden
        res.sendStatus(403);
    }
}

function validateDatetime(date) {
    var regex = new RegExp('^([1-2]\\d{3}-([0]?[1-9]|1[0-2])-([0-2]?[0-9]|3[0-1])) (20|21|22|23|[0-1]?\\d{1}):00:00$');
    if (!regex.test(date)) {
        return false;
    }
    return true;
}

function parseDaysFromDatetime(datetime) {
    const date = datetime.split(' ')[0];
    const days = date.split('-')[2];
    return parseInt(days);
}

function isTwoDaysLater(datetime) {
    return (
        parseDaysFromDatetime(datetime)
        -
        parseDaysFromDatetime(moment().format('YYYY-MM-D hh:mm:ss')) >= waitDays
    )
}

function nullifyMinsAndSecs(datetime) {
    const date = datetime.split(' ')[0];
    const hours = datetime.split(' ')[1].split(':')[0];
    return date + " " + hours + ":00:00";
}

function validateEmail(x) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (x == "") {
        console.log("Email can't be empty");

        return false;
    } else if (re.test(String(x).toLowerCase()) == false) {
        console.log("Invalid email");

        return false;
    }
    return true;
}

app.listen(port, () => console.log(`Server started on port ${port}`));