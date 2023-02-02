import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserNotFoundException } from 'src/users/exceptions/UserNotFound';
import { IUserService } from 'src/users/user';
import { Services } from 'src/utils/constants';
import { Friend, FriendRequest } from 'src/utils/typeorm';
import { AcceptRequestParams, CreateFriendRequestParams } from 'src/utils/types';
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

        const exitsRequest = await this.requestIsPending(sender.id, receiver.id);
        if (exitsRequest) throw new FriendRequestException();

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
        return this.friendRequestRepository.findOne({
            where: { id },
            relations: ['sender', 'receiver'],
        });
    }

    async acceptRequest(params: AcceptRequestParams): Promise<Friend> {
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
        return this.friendRepository.save(friend);
    }
}
