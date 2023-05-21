
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
    
# ReactChatApp API

This is the backend for the [ReactChatApp](https://github.com/orgball2608/ReactChatApp) project.

# Contents

  

1. [Installation & Setup](#Installation)

2. [Run](#Run)

3. [Implementation](#Implementation)

# Installation 

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

# Run
To run application you need:
- docker-compose
- env
## Local run


```

  npm run start:dev

```

or
```

  docker-compose up

```


# Implementation
  

- REST API

- Using Websocket (Socket.io) and Event emit to implement realtime action

- Using MYSQL as a main data storage

- Using TypeORM for mapping your TypeScript objects to a MySQL database

- Using AWS S3 and multer to upload image

- Env based application configuration

- Run with docker-compose

- Configured deploy to AWS

- Using Session to Authenticate


### Project structure

  

```

.
├── src
│ ├── attachments                        // attachments service
│ │ ├── attachments.controller.ts        // attachments controller
│ │ ├── attachments.module.ts 		     // attachments module
│ │ ├── attachments.service.ts           // attachments service
│ │ ├── attachments.ts				     // attachments interface
│ ├── auth                               // auth service
│ │ ├── auth.controller.ts               // auth controller
│ │ ├── auth.module.ts 		             // auth module
│ │ ├── auth.service.ts                  // auth service
│ │ ├── auth.ts				             // auth interface
│ │ ├── dtos				             // auth dtos
│ │ │ ├── CreateUser.dto.ts				 
│ │ ├── utils				             // auth utils
│ │ │ ├── Guards.ts				 		 // custom guards
│ │ │ ├── LocalStrategy.ts				
│ │ │ ├── SessionSerializer.ts			
│ ├── conversations                      // conversations service
│ │ ├── conversations.controller.ts      // conversations controller
│ │ ├── conversations.module.ts 		 // conversations module
│ │ ├── conversations.service.ts         // conversations service
│ │ ├── conversations.ts				 // conversations interface
│ │ ├── dtos				             // conversations dtos
│ │ │ ├── ChangeEmojiIcon.dto.ts
│ │ │ ├── ChangeNickname.dto.ts
│ │ │ ├── ChangeTheme.dto.ts
│ │ │ ├── CreateCoversation.dto.ts					 
│ │ ├── exceptions				         // conversations exceptions
│ │ │ ├── ConversationNotFound.ts	
│ │ │ ├── InvalidConversation.ts	
│ │ │ ├── NotConversationOwner.ts
│ ├── friend-requests                    // friend-requests service
│ │ ├── friend-requests.controller.ts    // friend-requests controller
│ │ ├── friend-requests.module.ts 		 //friend-requests module
│ │ ├── friend-requests.service.ts       // friend-requests service
│ │ ├── friend-requests.ts				 // friend-requests interface
│ │ ├── friend-requests.event.ts		 // friend-requests event
│ │ ├── dtos				             // friend-requests dtos
│ │ │ ├── CreateFriendRequest.dto.ts			 
│ │ ├── exceptions				         // friend-requests exceptions
│ │ │ ├── FriendRequest.ts	
│ │ │ ├── FriendRequestAccepted.ts	
│ │ │ ├── FriendRequestNotFound.ts
│ │ │ ├── FriendRequestPending.ts	
│ │ │ ├── FriendRequestNotFound.ts
│ ├── friends                             // friend service
│ │ ├── friend.controller.ts              // friend controller
│ │ ├── friend.module.ts 		          //friend module
│ │ ├── friend.service.ts                 // friend service
│ │ ├── friend.ts				          // friend interface		 
│ │ ├── exceptions				          // friend exceptions
│ │ │ ├── FriendNotFound.ts	
│ ├── gateway                             // gateway service
│ │ ├── gateway.adapter.ts                // authenticate WebSocket connections
│ │ ├── gateway.module.ts 		          // gateway module
│ │ ├── gateway.session.ts                // gateway service
│ │ ├── gateway.ts				          // on event and emit event :))
│ │ ├── dtos				              // gateway dtos
│ │ │ ├── CreateCall.dto.ts
│ │ │ ├── CreateGroupCall.dto.ts
│ │ │ ├── GroupVideoCallRejected.dto.ts
│ │ │ ├── GroupVideoCallHangUp.dto.ts	
│ │ │ ├── VideoCallHangUp.dto.ts
│ ├── groups                              // groups service
│ │ ├── controllers                       // groups controller
│ │ │ ├── group-attachments.controller.ts
│ │ │ ├── group-message-statuses.controller.ts
│ │ │ ├── group-messages.controller.ts
│ │ │ ├── group-receipients.controller.ts
│ │ │ ├── group.controller.ts
│ │ ├── services                           // groups service
│ │ │ ├── group-attachments.service.ts
│ │ │ ├── group-message-statuses.service.ts
│ │ │ ├── group-messages.service.ts
│ │ │ ├── group-receipients.service.ts
│ │ │ ├── group.service.ts
│ │ ├── interfaces                         // groups interfaces
│ │ │ ├── group-attachments.ts
│ │ │ ├── group-message-statuses.ts
│ │ │ ├── group-messages.ts
│ │ │ ├── group-receipients.ts
│ │ │ ├── group.ts
│ │ ├── middlewares                        // groups middlewares
│ │ │ ├── group.middleware.ts
│ │ ├── dtos				               // groups dtos
│ │ │ ├── AddGroupRecipient.dto.ts
│ │ │ ├── AddGroupRecipient.dto.ts	
│ │ │ ├── ChangeGroupEmojiDto.dto.ts	
│ │ │ ├── ChangeGroupNickname.dto.ts	
│ │ │ ├── ChangeGroupTheme.dto.ts	
│ │ │ ├── CreateGroup.dto.ts
│ │ │ ├── CreateGroupGifMessage.dto.ts
│ │ │ ├── CreateGroupStickerMessage.dto.ts	
│ │ │ ├── EditGroupMessage.dto.ts	
│ │ │ ├── EditGroupTitle.dto.ts	
│ │ │ ├── TransferOwner.dto.ts	
│ │ ├── exceptions				            // groups exceptions
│ │ │ ├── GroupNotFound.ts	
│ │ │ ├── GroupOwnerTransfer.ts	
│ │ │ ├── NotGroupOwner.ts
│ │ │ ├── UserNotFound.ts
│ ├── messages                             // messages service
│ │ ├── controllers                        // messages controller
│ │ │ ├── message-statuses.controller.ts
│ │ │ ├── messages.controller.ts
│ │ ├── services                           // messages service
│ │ │ ├── message-statuses.service.ts
│ │ │ ├── messages.service.ts
│ │ ├── interfaces                         // messages interfaces
│ │ │ ├── message-statuses.ts
│ │ │ ├── messages.ts
│ │ ├── dtos				               // messages dtos
│ │ │ ├── CreateGifMessage.dto.ts
│ │ │ ├── CreateMessage.dto.ts
│ │ │ ├── CreateStickerMessage.dto.ts	
│ │ │ ├── EditMessage.dto.ts
│ │ │ ├── RepyMessage.dto.ts		
│ │ │ ├── SearchMessageByContent.dto.ts
│ │ ├── exceptions				           // messages exceptions
│ │ │ ├── EmptyMessage.ts		
│ ├── reacts                               // reacts service
│ │ ├── controllers                        // reacts controller
│ │ │ ├── react-group-messages.controller.ts
│ │ │ ├── reacts.controller.ts
│ │ ├── reacts.service.ts                  // messages service
│ │ ├── reacts.module.ts                   // messages module
│ │ ├── reacts.ts                          // messages interface
│ │ ├── dtos				               // messages dtos
│ │ │ ├── CreateReact.dto.ts
│ ├── storage                              // storage service
│ │ ├── services                           // storage services
│ │ │ ├── index.ts
│ │ │ ├── storage.service.ts
│ │ ├── storage.controller.ts              // storage service
│ │ ├── storage.module.ts                  // storage module
│ │ ├── storage.ts                         // storage interface
│ ├── users                                // users service
│ │ ├── controllers                        // users controller
│ │ │ ├── user-profile.controller.ts
│ │ │ ├── reacts.controller.ts
│ │ ├── services                           // users service
│ │ │ ├── user-profile.service.ts
│ │ │ ├── reacts.service.ts
│ │ ├── interfaces                         //users interfaces
│ │ │ ├── user-profile.ts
│ │ │ ├── reacts.ts
│ │ ├── dtos				               // users dtos
│ │ │ ├── UpdateBio.dto.ts
│ │ │ ├── UpdateLocation.dto.ts
│ │ ├── exceptions				           // users exceptions
│ │ │ ├── UserNotFound.ts	
│ ├── utils                                // utils
│ │ ├── typeorm
│ │ ├── constants
│ │ ├── decorators
│ │ ├── helpers
│ │ ├── interfaces
│ ├── app.module.ts                        // app module
│ ├── main.ts                              // main
├── test
└─

```

