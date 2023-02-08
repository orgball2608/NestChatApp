import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { Services } from '../utils/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend } from '../utils/typeorm';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [UsersModule, TypeOrmModule.forFeature([Friend])],
    controllers: [FriendsController],
    providers: [
        {
            provide: Services.FRIENDS,
            useClass: FriendsService,
        },
    ],
    exports: [
        {
            provide: Services.FRIENDS,
            useClass: FriendsService,
        },
    ],
})
export class FriendsModule {}
