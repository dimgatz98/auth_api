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
```
Output:
``` bash

{
  token:
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJ1c2VyIjpbeyJpZCI6OCwiTGFzdE5hbWUiOiJHa2F0emlvdXJhcyIsIkZpcnN0TmFtZSI6ImRpbWl0cmlzIiwiQWNhZGVtaWNFbWFpbCI6ImV4YW1wbGVAbnR1YS5tYWlsLmdyIiwiUGFzc3dvcmQiOiIkMmEkMTAkeXNFRE5BSTk4Nk1nYjBZOXhRYkhSZVhuYW1udTh4OHFiWWdla2g0S3l6TjRaTlFsNlVzbVMifV0sImlhdCI6MTY1MDAyNTA0MywiZXhwIjoxNjUwNjI5ODQzfQ.l-3n4n0mkfH8zHcUgkxxhMvdF_iikuyY2qME-8nflwg'
}
```
---
``` bash
# Reserve resource
$ app_cli reserve --datetime '2022-07-16 14:00:00'
```
Output:
``` bash
Token: # paste your token here
```
---
``` bash
# Start resource only if current datetime matches a datetime you already reserved
$ app_cli start
```
Output
``` bash
Token: # paste your token here
```