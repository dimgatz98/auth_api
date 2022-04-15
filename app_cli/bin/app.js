#! /usr/bin/env node

const moment = require('moment')

const axios = require('axios');

const yargs = require("yargs");

require('dotenv').config({path:__dirname+'/../../.env'});

const { exit } = require('yargs');

var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.stdoutMuted = false;

rl._writeToOutput = function _writeToOutput(stringToWrite) {
  if (rl.stdoutMuted)
    rl.output.write("");
  else
    rl.output.write(stringToWrite);
};

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
            exit(0);
        }).catch(function (error) {
          console.log("Something went wrong");
          exit(0);
        });
    }
});

yargs.command({
    command: 'reserve',
    describe: `Datetime to reserve the resource
    --datetime, datetime for the resource to be reserved in the form YYYY-MM-DD HH:00:00
    `,
    builder: {
        datetime: {
            describe: 'Datetime to reserve',
            demandOption: true,
            type: 'string'
        },
    },

    handler(argv) {
      console.log("Token: ");

      rl.stdoutMuted = true;
      rl.question("", function (token) {
        const datetime = argv.datetime;
        const payload = {datetime: datetime};

        axios.post(`http://localhost:${port}/api/datetime/set`, data=payload, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }).then(resp => {
            console.log(resp.data);
            exit(0);
        }).catch(function (error) {
          console.log("Something went wrong");
          exit(0);
        });
      });
    }
});

yargs.command({
    command: 'start',
    describe: `Start resource if reserved for the current hour
    `,

    handler(argv) {
      console.log("Token: ");

      rl.stdoutMuted = true;
      rl.question("", function (token) {
        axios.get(`http://localhost:${port}/api/start`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          }).then(resp => {
            console.log(resp.data);
            exit(0);
        }).catch(function (error) {
          console.log("Something went wrong")
          exit(0);
        });
      });
    }
});

yargs.command({
  command: 'list',
  describe: `List all reservations for certain date
  --date, the date you would like to list the reservations for in the format YYYY-MM-DD
  `,
  builder: {
      date: {
          describe: 'date',
          demandOption: true,
          type: 'string'
      }
  },

  handler(argv) {
    console.log("Token: ");

    rl.stdoutMuted = true;
    rl.question("", function (token) {

      const date = argv.date;
      const payload = {date: date}

      axios.post(`http://localhost:${port}/api/datetime/list`, data = payload, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }).then(resp => {
          const reservations = [];
          for (d of resp.data.message){
            var hours = ((parseInt(moment.utc(d.datetime).format("HH")) + 3) % 24).toString();
            if (hours.length == 1) {
              hours = "0" + hours;
            }
            const minutes = moment.utc(d.datetime).format("mm")
            reservations.push(hours + ":" + minutes);
          }
          reservations.sort();
          console.log(reservations);
          exit(0);
      }).catch(function (error) {
          console.log("Something went wrong");
          exit(0);
      });
      rl.close();
    });
  }
});

yargs.parse();
