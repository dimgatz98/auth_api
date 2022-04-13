#! /usr/bin/env node

const axios = require('axios');

const yargs = require("yargs");

require('dotenv').config({path:__dirname+'/../../.env'});

const port = process.env.PORT || 3333;

yargs.command({
    command: 'login',
    describe: `Login to the auth api
    --email, your academic email,
    --password, your password
    `,
    builder: {
        email: {
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
        const email = argv.email;
        const password = argv.password;
        const payload = {email: email, password: password};

        axios.post(`http://localhost:${port}/api/login`, payload).then(resp => {

            console.log(resp.data);
        }).catch(function (error) {
            if (error.response) {
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
              } else if (error.request) {
                console.log(error.request);
              } else {
                console.log('Error', error.message);
              }
              console.log(error.config);
        });
    }
});

yargs.command({
    command: 'reserve',
    describe: `Datetime to reserve the resource
    --datetime, datetime for the resource to be reserved in the form YYYY-MM-D HH:00:00
    --token, your authorization token
    `,
    builder: {
        datetime: {
            describe: 'Datetime to reserve',
            demandOption: true,
            type: 'string'
        },
        token: {
            describe: 'Token',
            demandOption: true,
            type: 'string'
        }
    },

    handler(argv) {
        const datetime = argv.datetime;
        const token = argv.token;
        const payload = {datetime: datetime};

        axios.post(`http://localhost:${port}/api/datetime/set`, data=payload, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }).then(resp => {

            console.log(resp.data);
        }).catch(function (error) {
            if (error.response) {
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
              } else if (error.request) {
                console.log(error.request);
              } else {
                console.log('Error', error.message);
              }
              console.log(error.config);
        });
    }
});

yargs.command({
    command: 'start',
    describe: `Start resource if reserved for the current hour
    --token, your authorization token
    `,
    builder: {
        token: {
            describe: 'Token',
            demandOption: true,
            type: 'string'
        }
    },

    handler(argv) {
        const token = argv.token;

        axios.get(`http://localhost:${port}/api/start`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          }).then(resp => {

            console.log(resp.data);
        }).catch(function (error) {
            if (error.response) {
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
              } else if (error.request) {
                console.log(error.request);
              } else {
                console.log('Error', error.message);
              }
              console.log(error.config);
        });
    }
});

yargs.parse();
