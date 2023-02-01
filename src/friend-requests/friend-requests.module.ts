import { Module } from '@nestjs/common';
import { FriendRequestsService } from './friend-requests.service';
import { FriendRequestsController } from './friend-requests.controller';
import { FriendsModule } from 'src/friends/friends.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend, FriendRequest } from 'src/utils/typeorm';
import { Services } from 'src/utils/constants';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [FriendsModule, UsersModule, TypeOrmModule.forFeature([FriendRequest, Friend])],
    controllers: [FriendRequestsController],
    providers: [
        {
            provide: Services.FRIEND_REQUESTS,
            useClass: FriendRequestsService,
        },
    ],
    exports: [
        {
            provide: Services.FRIEND_REQUESTS,
            useClass: FriendRequestsService,
        },
    ],
})
export class FriendRequestsModule {}
