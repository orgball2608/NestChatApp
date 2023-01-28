import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IGroupRecipientService } from '../interfaces/group-recipients';
import { AddGroupRecipientParams } from '../../utils/types';
import { IGroupService } from '../interfaces/groups';
import { IUserService } from '../../users/user';
import { Services } from '../../utils/constants';

@Injectable()
export class GroupRecipientsService implements IGroupRecipientService {
    constructor(
        @Inject(Services.USERS) private userService: IUserService,
        @Inject(Services.GROUPS) private groupService: IGroupService,
    ) {}

    async addGroupRecipient(params: AddGroupRecipientParams) {
        const { groupId, userId, email } = params;
        const group = await this.groupService.getGroupById({ id: groupId, userId });
        if (!group) throw new HttpException('Group Not Found', HttpStatus.BAD_REQUEST);
        const recipient = await this.userService.findUser({ email });
        if (!recipient) throw new HttpException('User of Email Not Found', HttpStatus.BAD_REQUEST);
        if (group.creator.id !== userId) throw new HttpException('Insufficient Permissions', HttpStatus.BAD_REQUEST);
        const userInGroup = group.users.find((user) => user.id === recipient.id);
        if (userInGroup) throw new HttpException('User already in group', HttpStatus.BAD_REQUEST);
        group.users = [...group.users, recipient];
        const savedGroup = await this.groupService.saveGroup(group);
        return { group: savedGroup, user: recipient };
    }
}
