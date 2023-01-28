import { Body, Controller, Inject, Param, ParseIntPipe, Post } from '@nestjs/common';
import { Routes, Services } from '../../utils/constants';
import { IGroupRecipientService } from '../interfaces/group-recipients';
import { AuthUser } from '../../utils/decorator';
import { User } from '../../utils/typeorm';
import { AddGroupRecipientDto } from '../dtos/AddGroupRecipient.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

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
}
