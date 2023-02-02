import { Friend, User } from 'src/utils/typeorm';
import { DeleteFriendParams, GetFriendParams } from 'src/utils/types';

export interface IFriendService {
    getFriends(user: User): Promise<Friend[]>;
    getFriend(params: GetFriendParams): Promise<Friend>;
    deleteFriend(params: DeleteFriendParams);
}
