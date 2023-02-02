import { Body, Controller, Delete, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorator';
import { User } from 'src/utils/typeorm';
import { CreateFriendRequestDto } from './dtos/CreateFriendRequest.dto';
import { FriendRequestsService } from './friend-requests.service';

@Controller(Routes.FRIEND_REQUESTS)
export class FriendRequestsController {
    constructor(@Inject(Services.FRIEND_REQUESTS) private readonly friendRequestsService: FriendRequestsService) {}

    @Post()
    async createFriendRequest(@AuthUser() user: User, @Body() { email }: CreateFriendRequestDto) {
        return this.friendRequestsService.createFriendRequest({ user, email });
    }

    @Get(':id')
    async getFriendRequest(@Param('id') id: number) {
        return await this.friendRequestsService.getRequestById(id);
    }

    @Post(':id/accept')
    async acceptFriendRequest(@AuthUser() user: User, @Param('id') id: number) {
        return await this.friendRequestsService.acceptRequest({ userId: user.id, id });
    }

    @Delete(':id/cancel')
    cancelFriendRequest(@AuthUser() user: User, @Param('id') requestId: number) {
        return this.friendRequestsService.cancelRequest({ userId: user.id, requestId });
    }

    @Patch(':id/reject')
    rejectFriendRequest(@AuthUser() user: User, @Param('id') requestId: number) {
        return this.friendRequestsService.rejectRequest({ receiverId: user.id, requestId });
    }
}
