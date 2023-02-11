import { Body, Controller, Delete, Inject, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { Routes, Services } from '../../utils/constants';
import { IGroupRecipientService } from '../interfaces/group-recipients';
import { AuthUser } from '../../utils/decorator';
import { User } from '../../utils/typeorm';
import { AddGroupRecipientDto } from '../dtos/AddGroupRecipient.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AddGroupRecipientsParams } from 'src/utils/types';

@Controller(Routes.GROUP_RECIPIENTS)
export class GroupRecipientsController {
    constructor(
        @Inject(Services.GROUP_RECIPIENTS) private readonly groupRecipientService: IGroupRecipientService,
        private eventEmitter: EventEmitter2,
    ) {}
    @Post()
    async addGroupRecipient(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) groupId: number,
        @Body() { email }: AddGroupRecipientDto,
    ) {
        const response = await this.groupRecipientService.addGroupRecipient({
            userId: user.id,
            groupId,
            email,
        });
        this.eventEmitter.emit('group.recipients.add', response);
        return response;
    }

    @Post('recipients')
    async addGroupRecipients(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) groupId: number,
        @Body() { emails }: AddGroupRecipientsParams,
    ) {
        const response = await this.groupRecipientService.addGroupRecipients({
            userId: user.id,
            groupId,
            emails,
        });
        this.eventEmitter.emit('group.recipients.add.many', response);
        return response;
    }

    @Delete(':userId')
    async removeGroupRecipient(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) groupId: number,
        @Param('userId', ParseIntPipe) removeUserId: number,
    ) {
        const response = await this.groupRecipientService.removeGroupRecipient({
            userId: user.id,
            groupId,
            removeUserId,
        });

        this.eventEmitter.emit('group.recipients.remove', response);
        return response;
    }

    @Patch()
    async leaveGroup(@AuthUser() user: User, @Param('id', ParseIntPipe) groupId: number) {
        const response = await this.groupRecipientService.leaveGroup({
            userId: user.id,
            groupId,
        });
        this.eventEmitter.emit('group.user.leave', response);
        return response;
    }
}
