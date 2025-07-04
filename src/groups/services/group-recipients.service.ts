import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IGroupRecipientService } from '../interfaces/group-recipients';
import {
    AddGroupRecipientParams,
    AddGroupRecipientsParams,
    AddGroupRecipientsResponse,
    CheckUserInGroupParams,
    leaveGroupResponse,
    RemoveGroupRecipientParams,
} from '../../utils/types';
import { IGroupService } from '../interfaces/groups';
import { IUserService } from '../../users/interfaces/user';
import { Services } from '../../utils/constants';
import { GroupNotFoundException } from '../exceptions/GroupNotFoundException';
import { NotGroupOwnerException } from '../exceptions/NotGroupOwnerException';
import { Group } from 'src/utils/typeorm';

@Injectable()
export class GroupRecipientsService implements IGroupRecipientService {
    constructor(
        @Inject(Services.USERS) private userService: IUserService,
        @Inject(Services.GROUPS) private groupService: IGroupService,
    ) {}

    async addGroupRecipient(params: AddGroupRecipientParams) {
        const { groupId, userId, email } = params;
        const group = await this.groupService.getGroupById({ id: groupId, userId });
        if (!group) throw new GroupNotFoundException();
        const recipient = await this.userService.findUser({ email });
        if (!recipient) throw new HttpException('User of Email Not Found', HttpStatus.BAD_REQUEST);
        if (group.owner.id !== userId) throw new NotGroupOwnerException();
        const userInGroup = group.users.find((user) => user.id === recipient.id);
        if (userInGroup) throw new HttpException('User already in group', HttpStatus.BAD_REQUEST);
        group.users = [...group.users, recipient];
        const savedGroup = await this.groupService.saveGroup(group);
        return { group: savedGroup, user: recipient };
    }

    async addGroupRecipients(params: AddGroupRecipientsParams): Promise<AddGroupRecipientsResponse> {
        const { groupId, userId, emails } = params;
        const group = await this.groupService.getGroupById({ id: groupId, userId });
        if (!group) throw new GroupNotFoundException();
        const usersPromise = emails.map((email) => this.userService.findUser({ email }, { selectAll: false }));
        const users = (await Promise.all(usersPromise)).filter((user) => user);
        if (users.length === 0) throw new HttpException('Cannot Find User to Add', HttpStatus.BAD_REQUEST);
        group.users.map((user) => {
            const userInGroup = users.find((userToAdd) => userToAdd.id === user.id);
            if (userInGroup) throw new HttpException('User already in group', HttpStatus.BAD_REQUEST);
        });
        if (group.owner.id !== userId) throw new NotGroupOwnerException();
        group.users = [...group.users, ...users];
        const savedGroup = await this.groupService.saveGroup(group);
        return { group: savedGroup, users: users };
    }

    async removeGroupRecipient(params: RemoveGroupRecipientParams) {
        const { userId, removeUserId, groupId } = params;
        const group = await this.groupService.getGroupById({
            id: groupId,
            userId,
        });
        const userToBeRemoved = await this.userService.findUser({
            id: removeUserId,
        });
        if (!userToBeRemoved) throw new HttpException('User cannot be removed', HttpStatus.BAD_REQUEST);
        if (!group) throw new GroupNotFoundException();
        if (group.owner.id !== userId) throw new NotGroupOwnerException();
        if (group.owner.id === removeUserId)
            throw new HttpException('Cannot remove yourself as owner', HttpStatus.BAD_REQUEST);
        group.users = group.users.filter((user) => user.id !== removeUserId);
        const savedGroup = await this.groupService.saveGroup(group);
        return { group: savedGroup, user: userToBeRemoved };
    }

    async isUserInGroup(params: CheckUserInGroupParams): Promise<Group> {
        const { userId, groupId } = params;
        const group = await this.groupService.getGroupById({ id: groupId, userId });
        if (!group) throw new GroupNotFoundException();
        return group;
    }

    async leaveGroup(params: CheckUserInGroupParams): Promise<leaveGroupResponse> {
        const { userId, groupId } = params;
        const group = await this.groupService.getGroupById({ id: groupId, userId });
        if (!group) throw new GroupNotFoundException();
        if (group.owner.id === userId) throw new HttpException('Cannot leave group as owner', HttpStatus.BAD_REQUEST);
        group.users = group.users.filter((user) => user.id !== userId);
        const savedGroup = await this.groupService.saveGroup(group);
        return { savedGroup, userId };
    }
}
