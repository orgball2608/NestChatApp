import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post } from '@nestjs/common';
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
    async createMessage(@AuthUser() user: User, @Body() createMessageDto: CreateMessageDto) {
        const response = await this.messageService.createMessage({
            ...createMessageDto,
            user,
        });
        this.eventEmitter.emit('message.create', response);
        return;
    }

    @Get(':conversationId')
    async getMessagesFromConversation(
        @AuthUser() user: User,
        @Param('conversationId', ParseIntPipe) conversationId: number,
    ) {
        const messages = await this.messageService.getMessagesByConversationId(conversationId);
        return { id: conversationId, messages };
    }
}
