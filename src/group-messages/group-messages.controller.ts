import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post } from '@nestjs/common';
import { Routes, Services } from '../utils/constants';
import { AuthUser } from '../utils/decorator';
import { User } from '../utils/typeorm';
import { CreateGroupMessageDto } from './dtos/CreateGroupMessage.dto';
import { getGroupMessagesResponse } from '../utils/types';

@Controller(Routes.GROUP_MESSAGES)
export class GroupMessagesController {
    constructor(@Inject(Services.GROUP_MESSAGES) private readonly groupMessageService) {}
    @Post()
    async createGroupMessage(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) groupId: number,
        @Body() { content }: CreateGroupMessageDto,
    ) {
        this.groupMessageService.createGroupMessage({
            author: user,
            groupId,
            content,
        });
    }

    @Get()
    async getGroupMessages(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) groupId: number,
    ): Promise<getGroupMessagesResponse> {
        const messages = await this.groupMessageService.getGroupMessages({ groupId, author: user });
        return { groupId, messages };
    }
}
