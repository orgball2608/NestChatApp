import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IGroupService } from '../interfaces/groups';
import { Group, GroupNickname, User } from '../../utils/typeorm';
import { Repository } from 'typeorm';
import {
    AccessParams,
    ChangeEmojiIconParams,
    ChangeGroupEmojiIconParams,
    ChangeGroupNicknameParams,
    changeOwnerParams,
    CreateGroupParams,
    EditGroupTitleParams,
    GetGroupsByIdParams,
    GetGroupsParams,
    UpdateGroupAvatarParams,
} from '../../utils/types';
import { Services } from '../../utils/constants';
import { IUserService } from '../../users/interfaces/user';
import { GroupNotFoundException } from '../exceptions/GroupNotFoundException';
import { NotGroupOwnerException } from '../exceptions/NotGroupOwnerException';
import { UserNotFoundException } from '../exceptions/UserNotFound';
import { GroupOwnerTransferException } from '../exceptions/GroupOwnerTransfer';
import { generateUUIDV4 } from 'src/utils/helpers';

@Injectable()
export class GroupsService implements IGroupService {
    constructor(
        @InjectRepository(Group) private readonly groupRepository: Repository<Group>,
        @InjectRepository(GroupNickname) private readonly groupNicknameRepository: Repository<GroupNickname>,
        @Inject(Services.USERS) private readonly userService: IUserService,
        @Inject(Services.IMAGE_UPLOAD_SERVICE) private readonly imageUploadService,
    ) {}
    async createGroup(params: CreateGroupParams) {
        const { title, creator } = params;
        const usersPromise = params.users.map((email) => this.userService.findUser({ email }, { selectAll: false }));
        const users = (await Promise.all(usersPromise)).filter((user) => user);
        users.push(creator);
        const group = this.groupRepository.create({ owner: creator, users, creator, title });
        return this.groupRepository.save(group);
    }

    getGroups(params: GetGroupsParams) {
        return this.groupRepository
            .createQueryBuilder('group')
            .leftJoinAndSelect('group.users', 'user')
            .leftJoinAndSelect('group.lastMessageSent', 'lastMessageSent')
            .leftJoinAndSelect('lastMessageSent.author', 'author')
            .leftJoinAndSelect('lastMessageSent.attachments', 'attachments')
            .orderBy('lastMessageSent.createdAt', 'DESC')
            .leftJoinAndSelect('group.owner', 'owner')
            .leftJoinAndSelect('group.creator', 'creator')
            .leftJoinAndSelect('owner.profile', 'ownerProfile')
            .leftJoinAndSelect('creator.profile', 'creatorProfile')
            .leftJoinAndSelect('group.nicknames', 'nicknames')
            .leftJoinAndSelect('nicknames.user', 'userNickname')
            .leftJoinAndSelect('group.users', 'users')
            .leftJoinAndSelect('users.profile', 'usersProfile')
            .where('user.id = :userId', { userId: params.userId })
            .getMany();
    }

    async getGroupById(params: GetGroupsByIdParams) {
        const { id, userId } = params;
        const group = await this.groupRepository.findOne({
            where: {
                id,
            },
            relations: [
                'creator',
                'users',
                'lastMessageSent',
                'owner',
                'creator.profile',
                'owner.profile',
                'users.profile',
                'nicknames',
                'nicknames.user',
            ],
        });
        if (!group) throw new GroupNotFoundException();
        const checkUser = group.users.find((user) => user.id === userId);
        if (checkUser) return group;
    }
    saveGroup(group: Group) {
        return this.groupRepository.save(group);
    }

    async editGroupTitle(params: EditGroupTitleParams) {
        const { groupId, userId, title } = params;
        const group = await this.groupRepository.findOne({
            where: {
                id: groupId,
            },
            relations: [
                'creator',
                'users',
                'lastMessageSent',
                'owner',
                'creator.profile',
                'owner.profile',
                'users.profile',
                'nicknames',
                'nicknames.user',
            ],
        });
        if (!group) return;
        const checkUser = group.users.find((user) => user.id === userId);
        if (!checkUser) return;
        group.title = title;
        return this.groupRepository.save(group);
    }

    async hasAccess({ id, userId }: AccessParams): Promise<User> {
        const group = await this.getGroupById({ id, userId });
        if (!group) throw new GroupNotFoundException();
        return group.users.find((user) => user.id === userId);
    }

    async updateOwner() {
        this.groupRepository
            .find({
                relations: ['creator', 'users', 'lastMessageSent', 'owner'],
            })
            .then((groups) => {
                groups.forEach((group) => {
                    group.owner = group.creator;
                    this.groupRepository.save(group);
                });
            });
    }

    async changeOwner(params: changeOwnerParams) {
        const { groupId, userId, newOwnerId } = params;
        const group = await this.groupRepository.findOne({
            where: {
                id: groupId,
            },
            relations: ['creator', 'users', 'lastMessageSent', 'owner'],
        });
        if (!group) throw new GroupNotFoundException();
        const checkUser = group.owner.id === userId;
        if (!checkUser) throw new NotGroupOwnerException();

        if (group.owner.id === newOwnerId)
            throw new GroupOwnerTransferException('You are already the owner of this group');

        const checkNewOwner = group.users.find((user) => user.id === newOwnerId);
        if (!checkNewOwner) throw new GroupOwnerTransferException('The new owner is not a member of this group');

        const newOwner = await this.userService.findUser({ id: newOwnerId }, { selectAll: false });
        if (!newOwner) throw new UserNotFoundException();
        group.owner = newOwner;
        return await this.groupRepository.save(group);
    }

    async updateGroupAvatar(params: UpdateGroupAvatarParams) {
        const { groupId, userId, avatar } = params;
        const group = await this.getGroupById({ id: groupId, userId });
        if (!group) throw new GroupNotFoundException();
        const key = generateUUIDV4();
        const avatarUrl = await this.imageUploadService.uploadFile({
            key,
            file: avatar,
        });
        group.avatar = avatarUrl;
        const savedGroup = await this.groupRepository.save(group);
        return savedGroup;
    }

    async changeGroupEmojiIcon(params: ChangeGroupEmojiIconParams): Promise<Group> {
        const { groupId, userId, emoji } = params;
        const group = await this.getGroupById({ id: groupId, userId });
        if (!group) throw new GroupNotFoundException();
        group.emoji = emoji;
        return this.groupRepository.save(group);
    }

    async changeGroupNickname(params: ChangeGroupNicknameParams): Promise<Group> {
        const { groupId, email, nickname, authorId } = params;
        const group = await this.getGroupById({
            id: groupId,
            userId: authorId,
        });
        if (!group) throw new GroupNotFoundException();
        const user = group.users.find((user) => user.email === email);
        if (!user) throw new UserNotFoundException();
        const nicknameEntity = group.nicknames.find((nickname) => nickname.user.id === user.id);
        if (nicknameEntity) {
            nicknameEntity.nickname = nickname;
            group.nicknames = group.nicknames.filter((nickname) => nickname.user.id !== user.id);
            this.groupNicknameRepository.save(nicknameEntity);
            group.nicknames.push(nicknameEntity);
        } else {
            const newNickname = this.groupNicknameRepository.create({
                group,
                user,
                nickname,
            });
            this.groupNicknameRepository.save(newNickname);
            group.nicknames.push(newNickname);
        }
        return this.groupRepository.save(group);
    }
}
