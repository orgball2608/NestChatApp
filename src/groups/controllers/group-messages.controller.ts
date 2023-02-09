import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { Routes, Services } from '../../utils/constants';
import { AuthUser } from '../../utils/decorator';
import { User } from '../../utils/typeorm';
import { CreateGroupMessageDto } from '../dtos/CreateGroupMessage.dto';
import { getGroupMessagesResponse } from '../../utils/types';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EditGroupMessageDto } from '../dtos/EditGroupMessage.dto';

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

    @Delete(':messageId')
    async deleteGroupMessage(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) groupId: number,
        @Param('messageId', ParseIntPipe) messageId: number,
    ) {
        const messages = await this.groupMessageService.deleteGroupMessage({
            userId: user.id,
            groupId,
            messageId,
        });
        this.eventEmitter.emit('group.message.delete', {
            userId: user.id,
            messageId,
            groupId,
            messages,
        });
        return { groupId, messageId, messages };
    }

    @Patch(':messageId')
    async editGroupMessage(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) groupId: number,
        @Param('messageId', ParseIntPipe) messageId: number,
        @Body() { content }: EditGroupMessageDto,
    ) {
        const editedMessage = await this.groupMessageService.editGroupMessage({
            userId: user.id,
            groupId,
            messageId,
            content,
        });

        this.eventEmitter.emit('group.message.update', editedMessage);
        return editedMessage;
    }
}
