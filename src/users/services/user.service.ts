import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
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

    async createUser(userDetails: CreateUserDetails): Promise<User> {
        const existingUser = await this.userRepository.findOne({
            where: { email: userDetails.email },
        });
        if (existingUser) throw new HttpException('User already exists', HttpStatus.CONFLICT);

        const newPeer = this.peerRepository.create();

        const password = await hashPassword(userDetails.password);
        const newUser = this.userRepository.create({
            ...userDetails,
            password,
            peer: newPeer,
        });
        return this.userRepository.save(newUser);
    }

    async findUser(findUserParams: FindUserParams, options?: FindUserSelectOption): Promise<User | null> {
        const selections: (keyof User)[] = ['email', 'firstName', 'lastName', 'id', 'profile', 'peer'];
        const selectionsWithPassword: (keyof User)[] = [...selections, 'password'];

        const selectFields = options?.selectAll ? selectionsWithPassword : selections;

        const whereCondition: FindOptionsWhere<User> = {};
        if (findUserParams.id !== undefined) {
            whereCondition.id = findUserParams.id;
        }
        if (findUserParams.email !== undefined) {
            whereCondition.email = findUserParams.email;
        }
        if (Object.keys(whereCondition).length === 0 && !options?.selectAll) {
            return null;
        }

        return this.userRepository.findOne({
            where: whereCondition,
            select: selectFields,
            relations: ['profile', 'peer'],
        });
    }

    async saveUser(user: User): Promise<User> {
        return this.userRepository.save(user);
    }

    searchUsers(query: string): Promise<User[]> {
        return this.userRepository
            .createQueryBuilder('user')
            .where('user.firstName LIKE :query', { query: `%${query}%` })
            .orWhere('user.lastName LIKE :query', { query: `%${query}%` })
            .take(10)
            .select(['user.firstName', 'user.lastName', 'user.email', 'user.id'])
            .leftJoinAndSelect('user.profile', 'profile')
            .leftJoinAndSelect('user.peer', 'peer')
            .getMany();
    }

    async getUserById(id: number | string): Promise<User | null> {
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        if (isNaN(numericId)) {
            return null;
        }
        return this.userRepository.findOne({
            where: { id: numericId },
            relations: ['profile', 'peer'],
        });
    }

    async getUserByPeerId(peerId: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: { peer: { id: peerId } },
            relations: ['profile', 'peer'],
        });
    }
}
