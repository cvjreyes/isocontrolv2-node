## Start the project:

1. `npm i`
2. `npm start` => this will run `nodemon` which will stop on errors and log them
3. Do not use `npm run start-dev` since it will start pm2 on production mode => errors will not be logged in the console and server will not be stopped. Error logs need to be handled by emailing them or manually checking logs file everyday or email this file SOMETHING

### ENV

- NODE_NPSDN means inches or mms

### With Transaction:

- Safe way to update DB
- DO NOT USE WITH LOOPS => it WILL crash !!!

Explicar:

- checkAuth middleware
- send helper fn
- wrap all in try catch
- in catch console.error the error + send it to the front
- explain services
- explain micro-services
- explain validations
- explain WHY use services and validations ( SOLID principle )
- explain jwt => token
- exaplin md5 => password
- how, why and whenv to throw errors

### FOR DEVELOPMENT:

- nodemon
- In order to see logs and restart server at the same time, consider [this](https://stackoverflow.com/questions/19336435/restart-node-js-application-when-uncaught-exception-occurs)

### FOR PRODUCTION:

- pm2

### (CRON TAB)[https://crontab.guru/]

### DATABASE

- feed_forecast needs one column added: forecast
- status column added to estimated_pieps
- estimated_pipes now called ifd_pipes
- dpipes not being used?
