import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post } from '@nestjs/common';
import { Routes, Services } from '../utils/constants';
import { AuthUser } from '../utils/decorator';
import { User } from '../utils/typeorm';
import { CreateGroupMessageDto } from './dtos/CreateGroupMessage.dto';
import { getGroupMessagesResponse } from '../utils/types';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller(Routes.GROUP_MESSAGES)
export class GroupMessagesController {
    constructor(
        @Inject(Services.GROUP_MESSAGES) private readonly groupMessageService,
        private readonly eventEmitter: EventEmitter2,
    ) {}
    @Post()
    async createGroupMessage(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) groupId: number,
        @Body() { content }: CreateGroupMessageDto,
    ) {
        const response = await this.groupMessageService.createGroupMessage({
            author: user,
            groupId,
            content,
        });
        this.eventEmitter.emit('group.message.create', response);
        return;
    }

    @Get()
    async getGroupMessages(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<getGroupMessagesResponse> {
        const messages = await this.groupMessageService.getGroupMessages({ id, author: user });
        return { id, messages };
    }
}
