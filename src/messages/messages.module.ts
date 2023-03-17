import { Module } from '@nestjs/common';
import { MessagesService } from './services/messages.service';
import { MessagesController } from './controllers/messages.controller';
import { Services } from '../utils/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation, Group, GroupMessage, Message, MessageStatus } from '../utils/typeorm';
import { AttachmentsModule } from 'src/attachments/attachments.module';
import { MessageStatusesService } from './services/message-statuses.service';
import { MessageStatusesController } from './controllers/message-statuses.controller';
import { ConversationsModule } from '../conversations/conversations.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Message, Conversation, GroupMessage, Group, MessageStatus]),
        AttachmentsModule,
        ConversationsModule,
    ],
    providers: [
        {
            provide: Services.MESSAGES,
            useClass: MessagesService,
        },
        {
            provide: Services.MESSAGE_STATUSES,
            useClass: MessageStatusesService,
        },
    ],
    exports: [
        {
            provide: Services.MESSAGES,
            useClass: MessagesService,
        },
    ],
    controllers: [MessagesController, MessageStatusesController],
})
export class MessagesModule {}
