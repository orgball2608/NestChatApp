import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from './utils/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { GatewayModule } from './gateway/gateway.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GroupsModule } from './groups/groups.module';
import { StorageModule } from './storage/storage.module';
import { FriendsModule } from './friends/friends.module';
import { FriendRequestsModule } from './friend-requests/friend-requests.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { ReactsModule } from './reacts/reacts.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env',
        }),
        PassportModule.register({
            session: true,
        }),
        AuthModule,
        UsersModule,
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: process.env.MYSQL_DB_HOST,
            port: parseInt(process.env.MYSQL_DB_PORT),
            username: process.env.MYSQL_DB_USERNAME,
            password: process.env.MYSQL_DB_PASSWORD,
            database: process.env.MYSQL_DB_DATABASE,
            synchronize: true,
            entities,
        }),
        ConversationsModule,
        MessagesModule,
        GatewayModule,
        EventEmitterModule.forRoot(),
        GroupsModule,
        StorageModule,
        FriendsModule,
        FriendRequestsModule,
        AttachmentsModule,
        ReactsModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
