import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { Services } from '../utils/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile, User } from '../utils/typeorm';
import { UserProfileController } from './controllers/user-profile.controller';
import { UserProfileService } from './services/user-profile.service';

@Module({
    imports: [TypeOrmModule.forFeature([User, Profile])],
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
