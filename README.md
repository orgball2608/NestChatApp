<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
    
# ReactChatApp API

This is the backend for the [ReactChatApp](https://github.com/orgball2608/ReactChatApp) project.

# Installation & Setup

## Pre-requisites

-   Node.js v16
-   TypeORM version 0.2.37 in this project is confict @nest/typeorm (you can fix by `npm install typeorm@0.3.0` then `npm install` and `npm install typeorm@0.2.37` )
-   MySQL Server (or any SQL database that is supported by TypeORM).

## Setting up the Backend

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Create a `.env.development` file in the root directory and paste the following:

    ```
    PORT=

    MYSQL_DB_HOST=
    MYSQL_DB_USERNAME=
    MYSQL_DB_PASSWORD=
    MYSQL_DB_PORT=
    MYSQL_DB_DATABASE=

    SESSION_SECRET=
    COOKIE_SECRET=

    AWS_ACCESS_KEY_ID=
    AWS_SECRET_ACCESS_KEY=
    AWS_PUBLIC_BUCKET_KEY=
    AWS_REGION=
    ```

    - **`PORT`** The port your server will run on
    - **`MYSQL_DB_HOST`** The hostname for your MySQL database server
    - **`MYSQL_DB_USERNAME`** The username for your MySQL database
    - **`MYSQL_DB_PASSWORD`** The password for your MySQL user account
    - **`MYSQL_DB_PORT`** The port your MySQL server is running on (default 3306)
    - **`MYSQL_DB_NAME`** The name of your database (be sure to create it first otherwise an error will be thrown).
    - **`SESSION_SECRET`** Can be any string that can be used to encrypt & decrypt your session..
    - **`COOKIE_SECRET`** Can be any string that can be used to encrypt & decrypt your cookie.
    - **`AWS_ACCESS_KEY_ID`** Your access key to authenticate with Amazon S3. It's a string provided by AWS when you register for an account.
    - **`AWS_SECRET_ACCESS_KEY`** Your secret access key to authenticate with Amazon S3. It's a string provided by AWS when you register for an account.
    - **`AWS_PUBLIC_BUCKET_KEY`** The name of the Amazon S3 bucket that you want to store public resources in. This bucket must be created before you can use it to store public resources.
    - **`AWS_PUBLIC_BUCKET_KEY`** The region of the Amazon S3 server that you want to use. The default is "us-east-1", but you can change it to any other region that AWS supports.

4. Run `npm run start:dev` depending on which package manager you use to start the project in development mode.
