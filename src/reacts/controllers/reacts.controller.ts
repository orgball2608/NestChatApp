import { Body, Controller, Delete, Inject, Param, ParseIntPipe, Post } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorator';
import { User } from 'src/utils/typeorm';
import { CreateReactDto } from '../dtos/CreateReact.dto';
import { IReactService } from '../reacts';

@Controller(Routes.REACTS)
export class ReactsController {
    constructor(@Inject(Services.REACTS) private reactService: IReactService, private eventEmitter: EventEmitter2) {}

    @Post()
    async createReactMessage(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) conversationId: number,
        @Param('messageId', ParseIntPipe) messageId: number,
        @Body() { type }: CreateReactDto,
    ) {
        const response = await this.reactService.createReactMessage({
            user,
            messageId,
            type,
            conversationId,
        });
        this.eventEmitter.emit('messages.reaction', response);
        return response;
    }

    @Delete(':reactId/remove')
    async removeReactMessage(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) conversationId: number,
        @Param('messageId', ParseIntPipe) messageId: number,
        @Param('reactId', ParseIntPipe) reactId: number,
    ) {
        const response = await this.reactService.removeReact({
            user,
            messageId,
            reactId,
            id: conversationId,
        });
        this.eventEmitter.emit('messages.reaction.remove', response);
        return response;
    }
}
