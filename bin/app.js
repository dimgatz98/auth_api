require('dotenv').config();

const moment = require('moment')

const CronJob = require('cron').CronJob;

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

const cronExpression ="0 * * * *";

const cronJob = new CronJob(
    cronExpression,
    cronFunction
);

function cronFunction() {
    const now = moment().format('YYYY-MM-D HH:mm:ss');

    pool.query(`select * from ${db}.users`, (err, users) => {
        if (err) throw err;

        for (const user of users) {
            pool.query(`select datetime from ${db}.schedule where user_id=? and datetime=?`, [user.id, now], (_, results) => {
                if (results.length == 0) {
                    // Probably somehow check is resource is already reserved
                    console.log("Resource freed for user:", user.id);
                }

            });
        }
    });
}

const nextDates = cronJob.nextDates(10);
console.log("Next dates the job will run on:", nextDates.map(d => d.format("YYYY-MM-DD HH:mm")));

cronJob.start();

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
            const now = nullifyMinsAndSecs(moment().format('YYYY-MM-D HH:mm:ss'));
            const user_id = authData.user[0].id;

            pool.query(`select * from ${db}.schedule where user_id=? and datetime=?`, [user_id, now], (err, result) => {
                if (result.length > 0) {
                    pool.query(`delete from ${db}.schedule where datetime=?`, [now], (err) => {
                        if (err) throw err;

                        console.log('Reservation for datetime:', now, "and user:", user_id, "deleted.");
                    });

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

app.post('/api/datetime/list', verifyTokenMiddleware, (req, res) => {
    jwt.verify(req.token, process.env.SECRET_KEY, (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            const date = req.body.date;
            if (!validateDate(date) ) {
                res.json({
                    message: "Invalid date"
                });
            } else {
                pool.query(`select datetime from ${db}.schedule where datetime>=? and datetime<=?`, [date, nextDay(date)], (err, result) => {
                    if (err) throw err;

                    res.json({
                        message: result
                    });
                });
            }

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

function validateDate(date) {
    var regex = new RegExp('^([1-2]\\d{3}-([0]?[1-9]|1[0-2])-([0-2]?[0-9]|3[0-1]))$');
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
        parseDaysFromDatetime(moment().format('YYYY-MM-D HH:mm:ss')) >= waitDays
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

function nextDay(date) {
    return date + " 23:59:59";
}

function nextHour (datetime) {
    const hours = (parseInt(datetime.split(":")[2]) + 1) % 24;
    return datetime.split(":")[0]+datetime.split(":")[1]+hours.toString();
}

app.listen(port, () => console.log(`Server started on port ${port}`));
