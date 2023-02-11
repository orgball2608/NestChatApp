import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hashPassword } from '../../utils/helpers';
import { User } from '../../utils/typeorm';
import { CreateUserDetails, FindUserParams, FindUserSelectOption } from '../../utils/types';
import { IUserService } from '../interfaces/user';

@Injectable()
export class UserService implements IUserService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

    async createUser(userDetails: CreateUserDetails) {
        const existingUser = await this.userRepository.findOne({
            email: userDetails.email,
        });
        if (existingUser) throw new HttpException('User already exists', HttpStatus.CONFLICT);
        const password = await hashPassword(userDetails.password);
        const newUser = this.userRepository.create({ ...userDetails, password });
        return this.userRepository.save(newUser);
    }

    async findUser(findUserParams: FindUserParams, options?: FindUserSelectOption): Promise<User> {
        const selections: (keyof User)[] = ['email', 'firstName', 'lastName', 'id', 'profile'];
        const selectionsWithPassword: (keyof User)[] = [...selections, 'password'];
        const selectedKey = options?.selectAll ? selectionsWithPassword : selections;
        return this.userRepository.findOne(findUserParams, {
            select: selectedKey,
            relations: ['profile'],
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
            .select(['user.firstName', 'user.lastName', 'user.email', 'user.profile', 'user.id'])
            .leftJoinAndSelect('user.profile', 'profile')
            .getMany();
    }

    getUserById(id: string): Promise<User> {
        return this.userRepository.findOne(id);
    }
}
