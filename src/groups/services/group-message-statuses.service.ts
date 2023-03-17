import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group, GroupMessage, GroupMessageStatus } from '../../utils/typeorm';
import { Repository } from 'typeorm';
import { Services } from '../../utils/constants';
import { IGroupMessageStatusService } from '../interfaces/group-message-statuses';
import { IGroupService } from '../interfaces/groups';
import { UpdateGroupMessageStatus, UpdateGroupMessageStatusPayload } from '../../utils/types';
import { IGroupMessageService } from '../interfaces/group-messages';

@Injectable()
export class GroupMessageStatusesService implements IGroupMessageStatusService {
    constructor(
        @InjectRepository(GroupMessage) private readonly groupMessageRepository: Repository<GroupMessage>,
        @Inject(Services.GROUPS) private readonly groupService: IGroupService,
        @Inject(Services.GROUP_MESSAGES) private readonly groupMessageService: IGroupMessageService,
        @InjectRepository(Group) private readonly groupRepository: Repository<Group>,
        @InjectRepository(GroupMessageStatus)
        private readonly groupMessageStatusRepository: Repository<GroupMessageStatus>,
    ) {}

    async updateMessageStatus(params: UpdateGroupMessageStatus): Promise<UpdateGroupMessageStatusPayload> {
        const { author, messageId, groupId } = params;
        const group = await this.groupService.getGroupById({ id: groupId, userId: author.id });
        if (!group) throw new HttpException('No Group Found to Get GroupMessage', HttpStatus.BAD_REQUEST);
        const existUser = group.users.find((user) => user.id == author.id);
        if (!existUser) throw new HttpException('User not in Group !Cant get Messages', HttpStatus.BAD_REQUEST);
        const message = await this.groupMessageService.getGroupMessageById(messageId);
        if (!message) throw new HttpException('Cannot Find Message', HttpStatus.BAD_REQUEST);
        const existStatus = message.messageStatuses.find((status) => status.user.id === author.id);
        if (existStatus)
            return {
                groupId,
                message,
            };
        const messageStatus = this.groupMessageStatusRepository.create({
            user: author,
            message,
            seen: true,
        });
        const savedMessageStatus = await this.groupMessageStatusRepository.save(messageStatus);
        message.messageStatuses.push(savedMessageStatus);
        const savedMessage = await this.groupMessageRepository.save(message);
        return {
            groupId,
            message: savedMessage,
        };
    }
}
