#! /usr/bin/env node

require('dotenv').config({path:__dirname+'/../../.env'});

const yargs = require("yargs");

const {createPool} = require('mysql');

const db = process.env.DB

const pool = createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    connectionLimit: 10
});

const bcrypt = require('bcryptjs');
const { exit } = require('yargs');

const usage = "\nUsage: add or remove users from your mysql database";

yargs.command({
    command: 'add',
    describe: `Adds user in database
    --firstName, user's first name,
    --lastName, user's last name,
    --academicEmail, user's academic email,
    --password, user's password
    `,
    builder: {
        firstName: {
            describe: 'First Name',
            demandOption: true,
            type: 'string'
        },
        lastName: {
            describe: 'Last Name',
            demandOption: true,
            type: 'string'
        },
        academicEmail: {
            describe: 'Academic Email',
            demandOption: true,
            type: 'string'
        },
        password: {
            describe: 'Password',
            demandOption: true,
            type: 'string',
        }
    },

    handler(argv) {
        const firstName = argv.firstName;
        const lastName = argv.lastName;
        const academicEmail = argv.academicEmail;
        const hashedPassword = bcrypt.hashSync(argv.password, 10);

        pool.query(`select * from ${db}.users where academicEmail=?`, [academicEmail], (err, results) => {
            if (err) throw err;

            if (results.length > 0) {
                console.log("A user with that academic email already exists");
                exit(0);
            } else {
                pool.query(`insert into ${db}.users (LastName, FirstName, AcademicEmail, Password) \
                values (?, ?, ?, ?)`, [lastName, firstName, academicEmail, hashedPassword], (err) => {
                    if (err) throw err;

                    console.log("User inserted successfuly");
                    exit(0);
                });
            }
        });
    }
})

yargs.command({
    command: 'remove',
    describe: `Removes user from database
        --id, user's id
    `,
    builder: {
        id: {
            describe: `User's id`,
            demandOption: true,
            type: 'int'
        }
    },

    handler(argv) {
        const id = argv.id;

        pool.query(`select * from ${db}.users where id=?`, [id], (err, results) => {
            if (err) throw err;

            if (results.length == 0) {
                console.log("User doesn't exist");
                exit(0);
            } else {
                pool.query(`delete from ${db}.users where id = ?`, [id], (err) => {
                    if (err) throw err;

                    console.log("User deleted successfuly");
                    exit(0);
                });
            }
        });
    }
});

yargs.parse()
