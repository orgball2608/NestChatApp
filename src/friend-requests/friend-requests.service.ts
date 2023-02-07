import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import console from 'console';
import { UserNotFoundException } from 'src/users/exceptions/UserNotFound';
import { IUserService } from 'src/users/interfaces/user';
import { Services } from 'src/utils/constants';
import { Friend, FriendRequest } from 'src/utils/typeorm';
import {
    AcceptRequestParams,
    CancelRequestParams,
    CreateFriendRequestParams,
    RejectRequestParams,
} from 'src/utils/types';
import { Repository } from 'typeorm';
import { FriendRequestException } from './exceptions/FriendRequest';
import { FriendRequestAcceptedException } from './exceptions/FriendRequestAccepted';
import { FriendRequestNotFoundException } from './exceptions/FriendRequestNotFound';
import { IFriendRequestService } from './friend-requests';

@Injectable()
export class FriendRequestsService implements IFriendRequestService {
    constructor(
        @InjectRepository(FriendRequest)
        private readonly friendRequestRepository: Repository<FriendRequest>,
        @InjectRepository(Friend)
        private readonly friendRepository: Repository<FriendRequest>,
        @Inject(Services.USERS) private readonly usersService: IUserService,
    ) {}

    async createFriendRequest({ user: sender, email }: CreateFriendRequestParams) {
        const receiver = await this.usersService.findUser({ email });
        if (!receiver) throw new UserNotFoundException();

        if (sender.id === receiver.id) throw new FriendRequestException();

        const exitsRequest = await this.requestIsPending(sender.id, receiver.id);
        if (exitsRequest) throw new FriendRequestException();

        const exitsFriend = await this.requestIsAccepted(sender.id, receiver.id);
        if (exitsFriend) throw new FriendRequestException();

        const friend = this.friendRequestRepository.create({
            sender,
            receiver,
            status: 'pending',
        });
        return this.friendRequestRepository.save(friend);
    }

    requestIsPending(userOneId: number, userTwoId: number) {
        return this.friendRequestRepository.findOne({
            where: [
                {
                    sender: userOneId,
                    receiver: userTwoId,
                    status: 'pending',
                },
                {
                    sender: userTwoId,
                    receiver: userOneId,
                    status: 'pending',
                },
            ],
        });
    }

    requestIsAccepted(userOneId: number, userTwoId: number) {
        return this.friendRequestRepository.findOne({
            where: [
                {
                    sender: userOneId,
                    receiver: userTwoId,
                    status: 'accepted',
                },
                {
                    sender: userTwoId,
                    receiver: userOneId,
                    status: 'accepted',
                },
            ],
        });
    }

    async getRequestById(id: number) {
        const request = await this.friendRequestRepository.findOne({
            where: { id },
            relations: ['sender', 'receiver'],
        });
        if (!request) throw new FriendRequestNotFoundException();
        return request;
    }

    async acceptRequest(params: AcceptRequestParams) {
        const { id, userId } = params;
        const friendRequest = await this.getRequestById(id);
        if (!friendRequest) throw new FriendRequestNotFoundException();
        if (friendRequest.status === 'accepted') throw new FriendRequestAcceptedException();
        if (friendRequest.receiver.id !== userId) throw new FriendRequestNotFoundException();

        friendRequest.status = 'accepted';
        await this.friendRequestRepository.save(friendRequest);
        const friend = this.friendRepository.create({
            sender: friendRequest.sender,
            receiver: friendRequest.receiver,
        });
        const savedFriend = await this.friendRepository.save(friend);
        return {
            friend: savedFriend,
            friendRequest,
        };
    }

    async cancelRequest(params: CancelRequestParams) {
        const { userId, requestId } = params;
        const friendRequest = await this.getRequestById(requestId);
        if (!friendRequest) throw new FriendRequestNotFoundException();
        if (friendRequest.status === 'accepted') throw new FriendRequestAcceptedException();
        if (friendRequest.sender.id !== userId) throw new FriendRequestNotFoundException();
        return this.friendRequestRepository.delete(requestId);
    }

    async rejectRequest(params: RejectRequestParams) {
        const { receiverId, requestId } = params;
        const friendRequest = await this.getRequestById(requestId);
        if (!friendRequest) throw new FriendRequestNotFoundException();
        if (friendRequest.status === 'accepted') throw new FriendRequestAcceptedException();
        if (friendRequest.receiver.id !== receiverId) throw new FriendRequestNotFoundException();
        friendRequest.status = 'rejected';
        return this.friendRequestRepository.save(friendRequest);
    }

    getReceiveRequestsByUserId(userId: number): Promise<FriendRequest[]> {
        return this.friendRequestRepository.find({
            where: {
                status: 'pending',
                receiver: {
                    id: userId,
                },
            },
            relations: ['sender', 'receiver'],
        });
    }
}
