import { Body, Controller, Delete, Get, Inject, Param, Post } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Routes, ServerEvents, Services, WebsocketEvents } from 'src/utils/constants';
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
        this.event.emit(ServerEvents.FRIEND_REQUEST_CREATE, friendRequest);
        return friendRequest;
    }

    @Get('send')
    getSendedRequestsByUserId(@AuthUser() user: User) {
        const { id: userId } = user;
        return this.friendRequestsService.getSendedRequestsByUserId(userId);
    }

    @Get()
    async getReceivedRequestsByUserId(@AuthUser() user: User) {
        const { id: userId } = user;
        return await this.friendRequestsService.getReceivedRequestsByUserId(userId);
    }

    @Get(':id')
    async getFriendRequest(@Param('id') id: number) {
        return await this.friendRequestsService.getRequestById(id);
    }

    @Post(':id/accept')
    async acceptFriendRequest(@AuthUser() user: User, @Param('id') id: number) {
        const response = await this.friendRequestsService.acceptRequest({ userId: user.id, id });
        this.event.emit(ServerEvents.FRIEND_REQUEST_ACCEPTED, response);
        return response;
    }

    @Delete(':id/cancel')
    async cancelFriendRequest(@AuthUser() user: User, @Param('id') requestId: number) {
        const response = await this.friendRequestsService.cancelRequest({ userId: user.id, requestId });
        this.event.emit(ServerEvents.FRIEND_REQUEST_CANCELLED, response);
        return response;
    }

    @Post(':id/reject')
    async rejectFriendRequest(@AuthUser() user: User, @Param('id') id: number) {
        const response = await this.friendRequestsService.rejectRequest({ receiverId: user.id, requestId: id });
        this.event.emit(ServerEvents.FRIEND_REQUEST_REJECTED, response);
        return response;
    }
}
