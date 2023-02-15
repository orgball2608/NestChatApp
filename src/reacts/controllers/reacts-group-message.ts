import { Body, Controller, Inject, Param, ParseIntPipe, Post } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorator';
import { User } from 'src/utils/typeorm';
import { CreateReactDto } from '../dtos/CreateReact.dto';
import { IReactService } from '../reacts';

@Controller(Routes.REACTS_GROUP_MESSAGE)
export class ReactsGroupMessageController {
    constructor(@Inject(Services.REACTS) private reactService: IReactService, private eventEmitter: EventEmitter2) {}

    @Post()
    async createReactGroupMessage(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) groupId: number,
        @Param('messageId', ParseIntPipe) messageId: number,
        @Body() { type }: CreateReactDto,
    ) {
        const response = await this.reactService.createReactGroupMessage({
            user,
            messageId,
            type,
            groupId,
        });
        this.eventEmitter.emit('group.messages.reaction', response);
        return response;
    }
}
