import { Module } from '@nestjs/common';
import { GroupsController } from './controllers/groups.controller';
import { GroupsService } from './services/groups.service';
import { Services } from '../utils/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group, GroupMessage } from '../utils/typeorm';
import { UsersModule } from '../users/users.module';
import { GroupMessagesService } from './services/group-messages.service';
import { GroupMessagesController } from './controllers/group-messages.controller';

@Module({
    imports: [UsersModule, TypeOrmModule.forFeature([Group, GroupMessage])],
    controllers: [GroupsController, GroupMessagesController],
    providers: [
        {
            provide: Services.GROUPS,
            useClass: GroupsService,
        },
        {
            provide: Services.GROUP_MESSAGES,
            useClass: GroupMessagesService,
        },
    ],
    exports: [
        {
            provide: Services.GROUPS,
            useClass: GroupsService,
        },
    ],
})
export class GroupsModule {}
