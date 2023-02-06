import { Body, Controller, Delete, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthService } from 'src/auth/auth.service';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorator';
import { User } from 'src/utils/typeorm';
import { CreateFriendRequestDto } from './dtos/CreateFriendRequest.dto';
import { FriendRequestsService } from './friend-requests.service';

@Controller(Routes.FRIEND_REQUESTS)
export class FriendRequestsController {
    constructor(
        @Inject(Services.FRIEND_REQUESTS) private readonly friendRequestsService: FriendRequestsService,
        private event: EventEmitter2,
    ) {}

    @Post()
    async createFriendRequest(@AuthUser() user: User, @Body() { email }: CreateFriendRequestDto) {
        const friendRequest = await this.friendRequestsService.createFriendRequest({ user, email });
        this.event.emit('friendrequest.create', friendRequest);
        return friendRequest;
    }

    @Get(':id')
    async getFriendRequest(@Param('id') id: number) {
        return await this.friendRequestsService.getRequestById(id);
    }

    @Get()
    async getFriendRequestByUserId(@AuthUser() user: User) {
        const { id: userId } = user;
        return await this.friendRequestsService.getRequestsByUserId(userId);
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
