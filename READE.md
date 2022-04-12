## Auth api demo

First, create a .env file in the base directory of the project and add the following env variables:
```
PASSWORD="<your_my_sql_password>"
USER="<your_my_sql_username>"
HOST="<your_my_sql_host>"
SECRET_KEY="<secret_key_for_jwt"
PORT="<node_js_port>"
DB="<your_my_sql_database>"
```

### Install modules with:
```
$ npm install
```
### and start with:
```
$ nodemon
```
---

## Setup MySQL:

```
$ sudo apt install mysql-serve
```
```
$ sudo systemctl start mysql.service
```
Use the following command in order to secure your MySQL server:
```
$ sudo mysql_secure_installation
```
```
$ sudo mysql
```
In MySQL:
```
> CREATE USER 'username'@'host' IDENTIFIED WITH mysql_native_password BY 'password';

> GRANT ALL PRIVILEGES on *.* TO 'username'@'host' WITH GRANT OPTION;

> FLUSH PRIVILEGES;

> exit
```

Login from shell like that:
```
mysql -u dimitris -p
```

Create databases and tables:
```
> create database my_database;

> use my_database;

> CREATE TABLE users(id int NOT NULL AUTO_INCREMENT, LastName varchar(255) NOT NULL, FirstName varchar(255) NOT NULL, AcademicEmail varchar(255) NOT NULL UNIQUE, Password varchar(60) NOT NULL, PRIMARY KEY (id));

> insert into users (LastName, FirstName, AcademicEmail, Password) values ('Gkatziouras', 'Dimitrios', 'example@some_mail.gr', '1234');

> select * from users;

> create table schedule (user_id int NOT NULL, datetime datetime NOT NULL UNIQUE, foreign key(user_id) references users(id));

> insert into schedule (user_id, datetime) values (1, '2022-4-12 18:20:00');
```
