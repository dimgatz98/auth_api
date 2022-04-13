## Instal app_cli:
``` bash
$ npm install -g .
```

## Run app_cli:
``` bash
$ app_cli --help
```

## Example usage:
``` bash
# Retrieve token
$ app_cli login --email example@ntua.mail.gr --password 1234
# Reserve resource
$ app_cli reserve --datetime '2022-07-16 14:00:00' --token '<my_token>'
# Start resource only if current datetime matches a datetime you already reserved
$ app_cli start --token '<my_token>'
```