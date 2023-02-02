import { Controller, Delete, Get, Inject, Param, ParseIntPipe } from '@nestjs/common';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorator';
import { User } from 'src/utils/typeorm';
import { FriendsService } from './friends.service';

@Controller(Routes.FRIENDS)
export class FriendsController {
    constructor(@Inject(Services.FRIENDS) private readonly friendsService: FriendsService) {}

    @Get()
    async getFriends(@AuthUser() user: User) {
        const friends = await this.friendsService.getFriends(user);
        return friends;
    }

    @Delete(':id')
    async deleteFriend(@AuthUser() user: User, @Param('id', ParseIntPipe) removeUserId: number) {
        await this.friendsService.deleteFriend({ userId: user.id, removeUserId });
        return {
            userId: user.id,
            removeUserId,
        };
    }
}
