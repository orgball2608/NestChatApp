import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IGroupMessageService } from './group-messages';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupMessage } from '../utils/typeorm';
import { Repository } from 'typeorm';
import { CreateGroupMessageParams, getGroupMessagesParams } from '../utils/types';
import { Services } from '../utils/constants';
import { IGroupService } from '../groups/groups';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class GroupMessagesService implements IGroupMessageService {
    constructor(
        @InjectRepository(GroupMessage) private readonly groupMessageRepository: Repository<GroupMessage>,
        @Inject(Services.GROUPS) private readonly groupService: IGroupService,
    ) {}
    async createGroupMessage(params: CreateGroupMessageParams) {
        const { author, groupId, content } = params;
        const group = await this.groupService.getGroupById({ id: groupId, userId: author.id });
        if (!group) throw new HttpException('No Group Found to Create Group Message', HttpStatus.BAD_REQUEST);
        const existUser = group.users.find((user) => user.id == author.id);
        if (!existUser) throw new HttpException('User not in Group !Cant create Message', HttpStatus.BAD_REQUEST);
        const groupMessage = this.groupMessageRepository.create({
            author: instanceToPlain(author),
            group,
            content,
        });
        group.lastMessageSent = await this.groupMessageRepository.save(groupMessage);
        return this.groupService.saveGroup(group);
    }
    async getGroupMessages(params: getGroupMessagesParams) {
        const { author, groupId } = params;
        const group = await this.groupService.getGroupById({ id: groupId, userId: author.id });
        if (!group) throw new HttpException('No Group Found to Get GroupMessage', HttpStatus.BAD_REQUEST);
        const existUser = group.users.find((user) => user.id == author.id);
        if (!existUser) throw new HttpException('User not in Group !Cant get Messages', HttpStatus.BAD_REQUEST);
        return await this.groupMessageRepository.find({
            where: { id: groupId },
            relations: ['author'],
            order: {
                createdAt: 'DESC',
            },
        });
    }
}
