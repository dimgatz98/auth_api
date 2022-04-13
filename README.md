**Prerequisites for the api:**

1. Ubuntu

2. nodejs (node and npm)

## Install node and npm:
``` bash
$ sudo apt-get install python-software-properties
$ curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash –
$ sudo apt-get install nodejs
```

## Setup MySQL:

``` bash
$ sudo apt install mysql-server
```
``` bash
$ sudo systemctl start mysql.service
```
Use the following command in order to secure your MySQL server:
``` bash
$ sudo mysql_secure_installation
```
Execute mysql:
```
$ sudo mysql
```
In MySQL:
``` sql
> CREATE USER 'username'@'host' IDENTIFIED WITH mysql_native_password BY 'password';

> GRANT ALL PRIVILEGES on *.* TO 'username'@'host' WITH GRANT OPTION;

> FLUSH PRIVILEGES;

> exit
```

Login from shell with:
``` bash
$ mysql -u username -p
```

Create databases and tables:
``` sql
> create database my_database;

> use my_database;

> CREATE TABLE users(id int NOT NULL AUTO_INCREMENT, LastName varchar(255) NOT NULL, FirstName varchar(255) NOT NULL, AcademicEmail varchar(255) NOT NULL UNIQUE, Password varchar(60) NOT NULL, PRIMARY KEY (id));

-- Example user:
> insert into users (LastName, FirstName, AcademicEmail, Password) values ('Gkatziouras', 'Dimitrios', 'example@some_mail.gr', '1234');
-- In reality the password will be a hash created with bcrypt

> select * from users;

> delete from users where id=1;

> create table schedule (user_id int NOT NULL, datetime datetime NOT NULL UNIQUE, foreign key(user_id) references users(id));

> insert into schedule (user_id, datetime) values (1, '2022-4-12 18:20:00');
```
---
## Managing users with users_cli

You can manage the users in database with the users_cli. You can find the users_cli along with a tutorial [here](https://github.com/dimgatz98/auth_api/tree/master/users_cli)

---

## Auth api demo

First, create a .env file in the top-level directory of the project and add the following env variables:
```
# .env
PASSWORD="<your_my_sql_password>"
USER="<your_my_sql_username>"
HOST="<your_my_sql_host>"
SECRET_KEY="<secret_key_for_jwt"
PORT="<node_js_port>" # default=3333
DB="<your_my_sql_database>"
DAYS="<number_of_days_before_starting>" # default = 2
```

### Install modules with:
``` bash
$ npm install
```
### and start with:
``` bash
$ nodemon
```
