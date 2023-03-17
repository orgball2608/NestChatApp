import { MiddlewareConsumer, Module } from '@nestjs/common';
import { GroupsController } from './controllers/groups.controller';
import { GroupsService } from './services/groups.service';
import { Services } from '../utils/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation, Group, GroupMessage, GroupMessageStatus, GroupNickname, Message, User } from '../utils/typeorm';
import { UsersModule } from '../users/users.module';
import { GroupMessagesService } from './services/group-messages.service';
import { GroupMessagesController } from './controllers/group-messages.controller';
import { GroupRecipientsService } from './services/group-recipients.service';
import { GroupRecipientsController } from './controllers/group-recipients.controller';
import { GroupMiddleware } from './middlewares/group.middleware';
import { isAuthorized } from 'src/utils/helpers';
import { StorageModule } from 'src/storage/storage.module';
import { AttachmentsModule } from 'src/attachments/attachments.module';
import { MessagesModule } from 'src/messages/messages.module';
import { ConversationsModule } from 'src/conversations/conversations.module';
import { GroupAttachmentService } from './services/group-attachments.service';
import { GroupAttachmentsController } from './controllers/group-attachments.controller';
import { GroupMessageStatusesService } from './services/group-message-statuses.service';
import { GroupMessageStatusesController } from './controllers/group-message-statuses.controller';

@Module({
    imports: [
        UsersModule,
        TypeOrmModule.forFeature([Group, GroupMessage, User, GroupNickname, Message, Conversation, GroupMessageStatus]),
        StorageModule,
        AttachmentsModule,
        MessagesModule,
        ConversationsModule,
    ],
    controllers: [
        GroupsController,
        GroupMessagesController,
        GroupRecipientsController,
        GroupAttachmentsController,
        GroupMessageStatusesController,
    ],
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
        {
            provide: Services.GROUP_ATTACHMENTS,
            useClass: GroupAttachmentService,
        },
        {
            provide: Services.GROUP_MESSAGE_STATUS,
            useClass: GroupMessageStatusesService,
        },
    ],
    exports: [
        {
            provide: Services.GROUPS,
            useClass: GroupsService,
        },
        {
            provide: Services.GROUP_MESSAGES,
            useClass: GroupMessagesService,
        },
    ],
})
export class GroupsModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(isAuthorized, GroupMiddleware).forRoutes('groups/:id');
    }
}
