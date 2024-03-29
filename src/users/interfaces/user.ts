import { User } from '../../utils/typeorm';
import { CreateUserDetails, FindUserParams, FindUserSelectOption } from '../../utils/types';

export interface IUserService {
    createUser(userDetails: CreateUserDetails): Promise<User>;
    findUser(findUserParams: FindUserParams, options?: FindUserSelectOption): Promise<User>;
    saveUser(user: User): Promise<User>;
    searchUsers(query: string): Promise<User[]>;
    getUserById(id: string): Promise<User>;
    getUserByPeerId(peerId: string): Promise<User>;
}
