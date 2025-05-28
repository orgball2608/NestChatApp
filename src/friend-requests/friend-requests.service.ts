import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
        @InjectRepository(FriendRequest) private readonly friendRequestRepository: Repository<FriendRequest>,
        @InjectRepository(Friend) private readonly friendRepository: Repository<Friend>,
        @Inject(Services.USERS) private readonly usersService: IUserService,
    ) {}

    async createFriendRequest({ user: sender, email }: CreateFriendRequestParams): Promise<FriendRequest> {
        const receiver = await this.usersService.findUser({ email });
        if (!receiver) throw new UserNotFoundException();

        if (sender.id === receiver.id) throw new FriendRequestException('Cannot Add Yourself');

        const exitsRequest = await this.requestIsPending(sender.id, receiver.id);
        if (exitsRequest) throw new FriendRequestException('Friend request already pending');

        const exitsFriend = await this.friendRepository.findOne({
            where: [
                { sender: { id: sender.id }, receiver: { id: receiver.id } },
                { sender: { id: receiver.id }, receiver: { id: sender.id } },
            ],
        });
        if (exitsFriend) throw new FriendRequestException('Users are already friends');

        const friendRequestEntity = this.friendRequestRepository.create({
            sender,
            receiver,
            status: 'pending',
        });
        return this.friendRequestRepository.save(friendRequestEntity);
    }

    requestIsPending(userOneId: number, userTwoId: number): Promise<FriendRequest | null> {
        return this.friendRequestRepository.findOne({
            where: [
                { sender: { id: userOneId }, receiver: { id: userTwoId }, status: 'pending' },
                { sender: { id: userTwoId }, receiver: { id: userOneId }, status: 'pending' },
            ],
            relations: ['sender', 'receiver', 'sender.profile', 'receiver.profile'],
        });
    }

    requestIsAccepted(userOneId: number, userTwoId: number): Promise<FriendRequest | null> {
        return this.friendRequestRepository.findOne({
            where: [
                { sender: { id: userOneId }, receiver: { id: userTwoId }, status: 'accepted' },
                { sender: { id: userTwoId }, receiver: { id: userOneId }, status: 'accepted' },
            ],
            relations: ['sender', 'receiver', 'sender.profile', 'receiver.profile'],
        });
    }

    async getRequestById(id: number): Promise<FriendRequest> {
        const request = await this.friendRequestRepository.findOne({
            where: { id },
            relations: ['sender', 'receiver', 'sender.profile', 'receiver.profile'],
        });
        if (!request) throw new FriendRequestNotFoundException();
        return request;
    }

    async acceptRequest(params: AcceptRequestParams): Promise<{ friend: Friend; friendRequest: FriendRequest }> {
        const { id, userId } = params;
        const friendRequest = await this.getRequestById(id);
        if (friendRequest.status === 'accepted') throw new FriendRequestAcceptedException();
        if (friendRequest.receiver.id !== userId) throw new FriendRequestNotFoundException();

        friendRequest.status = 'accepted';
        await this.friendRequestRepository.save(friendRequest);

        const newFriend = this.friendRepository.create({
            sender: friendRequest.sender,
            receiver: friendRequest.receiver,
        });
        const savedFriend = await this.friendRepository.save(newFriend);
        return {
            friend: savedFriend,
            friendRequest,
        };
    }

    async cancelRequest(params: CancelRequestParams): Promise<FriendRequest> {
        const { userId, requestId } = params;
        const friendRequest = await this.getRequestById(requestId);
        if (friendRequest.status === 'accepted') throw new FriendRequestAcceptedException();
        if (friendRequest.sender.id !== userId) throw new FriendRequestNotFoundException();
        await this.friendRequestRepository.delete(requestId);
        return friendRequest;
    }

    async rejectRequest(params: RejectRequestParams): Promise<FriendRequest> {
        const { receiverId, requestId } = params;
        const friendRequest = await this.getRequestById(requestId);
        if (friendRequest.status === 'accepted') throw new FriendRequestAcceptedException();
        if (friendRequest.receiver.id !== receiverId) throw new FriendRequestNotFoundException();
        friendRequest.status = 'rejected';
        return this.friendRequestRepository.save(friendRequest);
    }

    getReceivedRequestsByUserId(userId: number): Promise<FriendRequest[]> {
        return this.friendRequestRepository.find({
            where: {
                status: 'pending',
                receiver: { id: userId },
            },
            relations: ['sender', 'receiver', 'sender.profile', 'receiver.profile'],
        });
    }

    getSendedRequestsByUserId(userId: number): Promise<FriendRequest[]> {
        return this.friendRequestRepository.find({
            where: {
                status: 'pending',
                sender: { id: userId },
            },
            relations: ['sender', 'receiver', 'sender.profile', 'receiver.profile'],
        });
    }

    getRequestByUserId(userOneId: number, userTwoId: number): Promise<FriendRequest | null> {
        return this.friendRequestRepository.findOne({
            where: [
                { sender: { id: userOneId }, receiver: { id: userTwoId }, status: 'pending' },
                { sender: { id: userTwoId }, receiver: { id: userOneId }, status: 'pending' },
            ],
            relations: ['sender', 'receiver', 'sender.profile', 'receiver.profile'],
        });
    }
}
