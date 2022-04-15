### Install project with:
``` bash
$ npm install -g .
```
### and run with:
``` bash
$ database_cli --help
```

Example usage:
``` bash
# adding a user:
$ database_cli add --firstName dimitris --lastName Gkatziouras --academicEmail example@some_mail.com --password 1234
# removing a user:
$ database_cli remove --id 1
# removing a reserved datetime:
$ database_cli unschedule --datetime '2022-04-16 21:00:00'
```
