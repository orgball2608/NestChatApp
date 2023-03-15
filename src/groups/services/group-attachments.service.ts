import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group, GroupMessage } from '../../utils/typeorm';
import { Repository } from 'typeorm';
import { Services } from '../../utils/constants';
import { IGroupService } from '../interfaces/groups';
import { IAttachmentService } from 'src/attachments/attachments';
import { IGroupAttachmentService } from '../interfaces/group-attachments';
import { GetGroupAttachmentsParams } from '../../utils/types';
import { GroupNotFoundException } from '../exceptions/GroupNotFoundException';
import { IGroupMessageService } from '../interfaces/group-messages';

@Injectable()
export class GroupAttachmentService implements IGroupAttachmentService {
    constructor(
        @InjectRepository(GroupMessage) private readonly groupMessageRepository: Repository<GroupMessage>,
        @Inject(Services.GROUPS) private readonly groupService: IGroupService,
        @Inject(Services.GROUP_MESSAGES) private readonly groupMessageService: IGroupMessageService,
        @InjectRepository(Group) private readonly groupRepository: Repository<Group>,
        @Inject(Services.ATTACHMENTS) private readonly attachmentsService: IAttachmentService,
    ) {}

    async getGroupAttachments(params: GetGroupAttachmentsParams) {
        const { author, id } = params;
        const group = await this.groupService.getGroupById({
            userId: author.id,
            id,
        });
        if (!group) throw new GroupNotFoundException();
        const existUser = group.users.find((user) => user.id == author.id);
        if (!existUser) throw new HttpException('User not in Group', HttpStatus.BAD_REQUEST);
        const groupMessages = await this.groupMessageService.getGroupMessages({
            id,
            author,
        });
        const groupAttachments = groupMessages.map((message) => message.attachments);
        return groupAttachments.filter((attachment) => attachment.length !== 0);
    }
}
