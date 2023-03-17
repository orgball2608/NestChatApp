import { Controller, Inject, Param, ParseIntPipe, Post } from '@nestjs/common';
import { Routes, Services } from '../../utils/constants';
import { AuthUser } from '../../utils/decorator';
import { User } from '../../utils/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IMessageStatusService } from '../interfaces/message-statuses';

@Controller(Routes.MESSAGES_STATUS)
export class MessageStatusesController {
    constructor(
        @Inject(Services.MESSAGE_STATUSES) private readonly messageStatusService: IMessageStatusService,
        private eventEmitter: EventEmitter2,
    ) {}

    @Post('')
    async updateMessageStatus(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe)
        conversationId: number,
        @Param('messageId', ParseIntPipe)
        messageId: number,
    ) {
        const response = await this.messageStatusService.updateMessageStatus({
            author: user,
            messageId,
            conversationId,
        });
        this.eventEmitter.emit('message.status.update', response);
        return response;
    }
}
