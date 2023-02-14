import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Services } from '../utils/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation, Message } from '../utils/typeorm';
import { AttachmentsModule } from 'src/attachments/attachments.module';

@Module({
    imports: [TypeOrmModule.forFeature([Message, Conversation]), AttachmentsModule],
    providers: [
        {
            provide: Services.MESSAGES,
            useClass: MessagesService,
        },
    ],
    exports: [
        {
            provide: Services.MESSAGES,
            useClass: MessagesService,
        },
    ],
    controllers: [MessagesController],
})
export class MessagesModule {}
