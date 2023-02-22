import { Body, Controller, Get, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/utils/Guards';
import { Routes, Services } from '../utils/constants';
import { AuthUser } from '../utils/decorator';
import { User } from '../utils/typeorm';
import { IConversationsService } from './conversations';
import { CreateConversationDto } from './dtos/CreateConversation.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChangeEmojiIconDto } from './dtos/ChangeEmojiIcon.dto';

@Controller(Routes.CONVERSATIONS)
@UseGuards(AuthenticatedGuard)
export class ConversationsController {
    constructor(
        @Inject(Services.CONVERSATIONS)
        private readonly conversationsService: IConversationsService,
        private eventEmitter: EventEmitter2,
    ) {}

    @Post()
    async createConversation(@AuthUser() user: User, @Body() createConversationPayload: CreateConversationDto) {
        const conversation = await this.conversationsService.createConversation(user, createConversationPayload);
        this.eventEmitter.emit('conversation.create', conversation);
        return conversation;
    }

    @Get()
    async getConversations(@AuthUser() { id }: User) {
        return this.conversationsService.getConversations(id);
    }

    @Get(':id')
    async getConversationById(@Param('id') id: number) {
        return await this.conversationsService.findConversationById(id);
    }

    @Post(':id/emoji')
    async changeEmojiIcon(@Param('id') id: number, @Body() { emoji }: ChangeEmojiIconDto) {
        const conversation = await this.conversationsService.changeEmojiIcon({
            id,
            emoji,
        });
        this.eventEmitter.emit('conversation.emoji.change', conversation);
        return conversation;
    }
}
