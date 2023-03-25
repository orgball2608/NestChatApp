import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { Services } from '../utils/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Peer, Profile, User } from '../utils/typeorm';
import { UserProfileController } from './controllers/user-profile.controller';
import { UserProfileService } from './services/user-profile.service';
import { StorageModule } from 'src/storage/storage.module';

@Module({
    imports: [TypeOrmModule.forFeature([User, Profile, Peer]), StorageModule, UsersModule],
    providers: [
        {
            provide: Services.USERS,
            useClass: UserService,
        },
        {
            provide: Services.USER_PROFILE,
            useClass: UserProfileService,
        },
    ],
    controllers: [UserController, UserProfileController],
    exports: [
        {
            provide: Services.USERS,
            useClass: UserService,
        },
        {
            provide: Services.USER_PROFILE,
            useClass: UserProfileService,
        },
    ],
})
export class UsersModule {}
