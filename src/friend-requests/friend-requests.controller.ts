import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
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
}
