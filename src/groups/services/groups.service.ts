import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IGroupService } from '../interfaces/groups';
import { Group } from '../../utils/typeorm';
import { Repository } from 'typeorm';
import { CreateGroupParams, GetGroupsByIdParams, GetGroupsParams } from '../../utils/types';
import { Services } from '../../utils/constants';
import { IUserService } from '../../users/user';

@Injectable()
export class GroupsService implements IGroupService {
    constructor(
        @InjectRepository(Group) private readonly groupRepository: Repository<Group>,
        @Inject(Services.USERS) private readonly userService: IUserService,
    ) {}
    async createGroup(params: CreateGroupParams) {
        const { title, creator } = params;
        const usersPromise = params.users.map((email) => this.userService.findUser({ email }, { selectAll: false }));
        const users = (await Promise.all(usersPromise)).filter((user) => user);
        users.push(creator);
        const group = this.groupRepository.create({ users, creator, title });
        return this.groupRepository.save(group);
    }

    async getGroups(params: GetGroupsParams) {
        return await this.groupRepository
            .createQueryBuilder('group')
            .leftJoinAndSelect('group.users', 'user')
            .leftJoinAndSelect('group.lastMessageSent', 'lastMessageSent')
            .leftJoinAndSelect('group.users', 'users')
            .where('user.id = :userId', { userId: params.userId })
            .getMany();
    }

    async getGroupById(params: GetGroupsByIdParams) {
        const { id, userId } = params;
        const group = await this.groupRepository.findOne({
            where: {
                id,
            },
            relations: ['creator', 'users', 'lastMessageSent'],
        });
        if (!group) return;
        const checkUser = group.users.find((user) => user.id == userId);
        if (checkUser) return group;
    }
    saveGroup(group: Group) {
        return this.groupRepository.save(group);
    }
}
