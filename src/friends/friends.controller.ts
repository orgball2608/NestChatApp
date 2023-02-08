import { Controller, Delete, Get, Inject, Param, ParseIntPipe } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Routes, ServerEvents, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorator';
import { User } from 'src/utils/typeorm';
import { FriendsService } from './friends.service';

@Controller(Routes.FRIENDS)
export class FriendsController {
    constructor(
        @Inject(Services.FRIENDS) private readonly friendsService: FriendsService,
        private readonly event: EventEmitter2,
    ) {}

    @Get()
    async getFriends(@AuthUser() user: User) {
        const friends = await this.friendsService.getFriends(user);
        return friends;
    }

    @Delete(':id')
    async deleteFriend(@AuthUser() user: User, @Param('id', ParseIntPipe) removeUserId: number) {
        const friend = await this.friendsService.deleteFriend({ userId: user.id, removeUserId });
        this.event.emit(ServerEvents.FRIEND_REMOVED, { userId: user.id, friend });
        return {
            userId: user.id,
            friend,
        };
    }
}
