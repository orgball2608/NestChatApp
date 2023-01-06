import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post } from '@nestjs/common';
import { Routes, Services } from '../utils/constants';
import { IMessageService } from './messages';
import { AuthUser } from '../utils/decorator';
import { User } from '../utils/typeorm';
import { CreateMessageDto } from './dtos/CreateMessage.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller(Routes.MESSAGES)
export class MessagesController {
    constructor(
        @Inject(Services.MESSAGES) private readonly messageService: IMessageService,
        private eventEmitter: EventEmitter2,
    ) {}
    @Post()
    async createMessage(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) conversationId: number,
        @Body() { content }: CreateMessageDto,
    ) {
        const params = { user, conversationId, content };
        const response = await this.messageService.createMessage(params);
        this.eventEmitter.emit('message.create', response);
        return;
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
    }
}
