import { Friend, FriendRequest } from 'src/utils/typeorm';
import {
    AcceptRequestParams,
    CancelRequestParams,
    CreateFriendRequestParams,
    RejectRequestParams,
} from 'src/utils/types';

export interface IFriendRequestService {
    createFriendRequest(params: CreateFriendRequestParams): Promise<FriendRequest>;
    requestIsPending(userOneId: number, userTwoId: number): Promise<FriendRequest>;
    requestIsAccepted(userOneId: number, userTwoId: number): Promise<FriendRequest>;
    getRequestById(id: number): Promise<FriendRequest>;
    getReceivedRequestsByUserId(userId: number): Promise<FriendRequest[]>;
    getSendedRequestsByUserId(userId: number): Promise<FriendRequest[]>;
    acceptRequest(params: AcceptRequestParams);
    cancelRequest(params: CancelRequestParams);
    rejectRequest(params: RejectRequestParams): Promise<FriendRequest>;
    getRequestByUserId(userOneId: number, userTwoId: number): Promise<FriendRequest>;
}
