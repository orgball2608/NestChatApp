# NestChatApp

## Overview
NestChatApp is a real-time chat application built using NestJS, TypeORM, MySQL, WebSocket, and Docker. This project aims to provide a scalable and efficient server-side application for real-time communication.

## Features
- **Real-time communication** using WebSocket (Socket.io) and Event emitters.
- **REST API** for handling various endpoints.
- **MySQL** as the main database.
- **TypeORM** for object-relational mapping.
- **AWS S3** for image uploads.
- **Docker** for containerization and easy deployment.
- **Session-based authentication** for secure user management.

## Table of Contents
1. [Installation & Setup](#installation-setup)
2. [Running the Application](#running-the-application)
3. [Implementation Details](#implementation-details)
4. [Contributing](#contributing)
5. [Troubleshooting](#troubleshooting)
6. [License](#license)

## Installation & Setup

### Pre-requisites
- Node.js v16
- TypeORM (version 0.2.37 is used in this project)
- MySQL Server (or any SQL database supported by TypeORM)

### Setting up the Backend
1. **Clone the repository**:
    ```bash
    git clone https://github.com/orgball2608/NestChatApp.git
    cd NestChatApp
    ```

2. **Install the dependencies**:
    - Then, install all the other dependencies:
        ```bash
        npm install
        ```

3. **Create a `.env.development` file** in the root directory and paste the following:
    ```plaintext
    PORT=<your_port>
    MYSQL_DB_HOST=<your_mysql_host>
    MYSQL_DB_USERNAME=<your_mysql_username>
    MYSQL_DB_PASSWORD=<your_mysql_password>
    MYSQL_DB_PORT=<your_mysql_port>
    MYSQL_DB_DATABASE=<your_mysql_database>
    SESSION_SECRET=<your_session_secret>
    COOKIE_SECRET=<your_cookie_secret>
    AWS_ACCESS_KEY_ID=<your_aws_access_key_id>
    AWS_SECRET_ACCESS_KEY=<your_aws_secret_access_key>
    AWS_PUBLIC_BUCKET_KEY=<your_aws_public_bucket_key>
    AWS_REGION=<your_aws_region>
    ```

4. **Start the application in development mode**:
    ```bash
    npm run start:dev
    ```

## Running the Application

### Local Run
To run the application locally, you will need Docker and docker-compose.

1. **Run using npm**:
    ```bash
    npm run start:dev
    ```

2. **Run using Docker**:
    ```bash
    docker-compose up
    ```

## Implementation Details

### Project Structure
```plaintext
.
├── src
│   ├── attachments
│   ├── auth
│   ├── conversations
│   ├── friend-requests
│   ├── friends
│   ├── gateway
│   ├── groups
│   ├── messages
│   ├── reacts
│   ├── storage
│   ├── users
│   ├── utils
│   ├── app.module.ts
│   └── main.ts
└── test
```

### Key Components
- **REST API**: Handles API requests and responses.
- **WebSocket**: Manages real-time communication.
- **MySQL**: Database for storing application data.
- **TypeORM**: Maps TypeScript objects to database tables.
- **AWS S3**: Manages image uploads and storage.
- **Docker**: Containerizes the application for easy deployment.

## Contributing
Contributions are welcome! Please follow these steps to contribute:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

## Troubleshooting
- Ensure all environment variables are correctly set.
- Verify the MySQL server is running and accessible.
- Check Docker and docker-compose installations.
- For any issues, please open a GitHub issue.

## License
This project is licensed under the UNLICENSED License. See the [LICENSE](LICENSE) file for details.
