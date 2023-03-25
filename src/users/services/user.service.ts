import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hashPassword } from '../../utils/helpers';
import { Peer, User } from '../../utils/typeorm';
import { CreateUserDetails, FindUserParams, FindUserSelectOption } from '../../utils/types';
import { IUserService } from '../interfaces/user';

@Injectable()
export class UserService implements IUserService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Peer) private readonly peerRepository: Repository<Peer>,
    ) {}

    async createUser(userDetails: CreateUserDetails) {
        const existingUser = await this.userRepository.findOne({
            email: userDetails.email,
        });
        if (existingUser) throw new HttpException('User already exists', HttpStatus.CONFLICT);
        const peer = this.peerRepository.create();
        const password = await hashPassword(userDetails.password);
        const params = { ...userDetails, password, peer };
        const newUser = this.userRepository.create(params);
        return this.userRepository.save(newUser);
    }

    async findUser(findUserParams: FindUserParams, options?: FindUserSelectOption): Promise<User> {
        const selections: (keyof User)[] = ['email', 'firstName', 'lastName', 'id', 'profile'];
        const selectionsWithPassword: (keyof User)[] = [...selections, 'password'];
        const selectedKey = options?.selectAll ? selectionsWithPassword : selections;
        return this.userRepository.findOne(findUserParams, {
            select: selectedKey,
            relations: ['profile', 'peer'],
        });
    }

    async saveUser(user: User) {
        return this.userRepository.save(user);
    }

    searchUsers(query: string): Promise<User[]> {
        const statement = '(user.firstName LIKE :query)';
        const statement2 = '(user.lastName LIKE :query)';
        return this.userRepository
            .createQueryBuilder('user')
            .where(statement, { query: `%${query}%` })
            .orWhere(statement2, { query: `%${query}%` })
            .limit(10)
            .select(['user.firstName', 'user.lastName', 'user.email', 'user.profile', 'user.id', 'user.peer'])
            .leftJoinAndSelect('user.profile', 'profile')
            .getMany();
    }

    getUserById(id: string): Promise<User> {
        return this.userRepository.findOne(id);
    }
}
