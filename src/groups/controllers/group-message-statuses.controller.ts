import { Controller, Inject, Param, ParseIntPipe, Post } from '@nestjs/common';
import { Routes, Services } from '../../utils/constants';
import { AuthUser } from '../../utils/decorator';
import { User } from '../../utils/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IGroupMessageStatusService } from '../interfaces/group-message-statuses';

@Controller(Routes.GROUP_MESSAGE_STATUSES)
export class GroupMessageStatusesController {
    constructor(
        @Inject(Services.GROUP_MESSAGE_STATUS) private readonly groupMessageStatusService: IGroupMessageStatusService,
        private eventEmitter: EventEmitter2,
    ) {}

    @Post('')
    async updateGroupMessageStatus(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe)
        groupId: number,
        @Param('messageId', ParseIntPipe)
        messageId: number,
    ) {
        const response = await this.groupMessageStatusService.updateMessageStatus({
            author: user,
            messageId,
            groupId,
        });

        this.eventEmitter.emit('group.message.status.update', response);
        return response;
    }
}
