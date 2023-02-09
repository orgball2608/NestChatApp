import { MiddlewareConsumer, Module } from '@nestjs/common';
import { GroupsController } from './controllers/groups.controller';
import { GroupsService } from './services/groups.service';
import { Services } from '../utils/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group, GroupMessage, User } from '../utils/typeorm';
import { UsersModule } from '../users/users.module';
import { GroupMessagesService } from './services/group-messages.service';
import { GroupMessagesController } from './controllers/group-messages.controller';
import { GroupRecipientsService } from './services/group-recipients.service';
import { GroupRecipientsController } from './controllers/group-recipients.controller';
import { GroupMiddleware } from './middlewares/group.middleware';
import { isAuthorized } from 'src/utils/helpers';
import { StorageModule } from 'src/storage/storage.module';

@Module({
    imports: [UsersModule, TypeOrmModule.forFeature([Group, GroupMessage, User]), StorageModule],
    controllers: [GroupsController, GroupMessagesController, GroupRecipientsController],
    providers: [
        {
            provide: Services.GROUPS,
            useClass: GroupsService,
        },
        {
            provide: Services.GROUP_MESSAGES,
            useClass: GroupMessagesService,
        },
        {
            provide: Services.GROUP_RECIPIENTS,
            useClass: GroupRecipientsService,
        },
    ],
    exports: [
        {
            provide: Services.GROUPS,
            useClass: GroupsService,
        },
    ],
})
export class GroupsModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(isAuthorized, GroupMiddleware).forRoutes('groups/:id');
    }
}
