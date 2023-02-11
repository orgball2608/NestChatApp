import {
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { Routes, Services } from '../utils/constants';
import { IMessageService } from './messages';
import { AuthUser } from '../utils/decorator';
import { User } from '../utils/typeorm';
import { CreateMessageDto } from './dtos/CreateMessage.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EditMessageDto } from './dtos/EditMessage.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AttachmentFile } from 'src/utils/types';
import { EmptyMessageException } from './exceptions/EmptyMessage';

@Controller(Routes.MESSAGES)
export class MessagesController {
    constructor(
        @Inject(Services.MESSAGES) private readonly messageService: IMessageService,
        private eventEmitter: EventEmitter2,
    ) {}

    @Post()
    @UseInterceptors(
        FileFieldsInterceptor([
            {
                name: 'attachments',
                maxCount: 5,
            },
        ]),
    )
    async createMessage(
        @AuthUser() user: User,
        @UploadedFiles() { attachments }: { attachments: AttachmentFile[] },
        @Param('id', ParseIntPipe)
        conversationId: number,
        @Body() { content }: CreateMessageDto,
    ) {
        if (!attachments && !content) throw new EmptyMessageException();
        const params = { user, conversationId, content, attachments };
        const response = await this.messageService.createMessage(params);
        this.eventEmitter.emit('message.create', response);
        return response;
    }

    @Get()
    async getMessagesFromConversation(@AuthUser() user: User, @Param('id', ParseIntPipe) id: number) {
        const messages = await this.messageService.getMessagesByConversationId(id);
        return { id: id, messages };
    }

    @Delete(':messageId')
    async deleteMessageFromConversation(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) conversationId: number,
        @Param('messageId', ParseIntPipe) messageId: number,
    ) {
        await this.messageService.deleteMessage({
            userId: user.id,
            conversationId,
            messageId,
        });

        this.eventEmitter.emit('message.delete', {
            userId: user.id,
            messageId,
            conversationId,
        });

        return { conversationId, messageId };
    }

    @Patch(':messageId')
    async editMessage(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) conversationId: number,
        @Param('messageId', ParseIntPipe) messageId: number,
        @Body() { content }: EditMessageDto,
    ) {
        const params = { userId: user.id, content, conversationId, messageId };
        const messageResponse = await this.messageService.editMessage(params);
        this.eventEmitter.emit('message.edit', messageResponse);
        return messageResponse;
    }
}
