import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IGroupMessageService } from '../interfaces/group-messages';
import { InjectRepository } from '@nestjs/typeorm';
import { Group, GroupMessage } from '../../utils/typeorm';
import { Repository } from 'typeorm';
import {
    CreateGroupMessageParams,
    DeleteGroupMessageParams,
    EditGroupMessageParams,
    getGroupMessagesParams,
} from '../../utils/types';
import { Services } from '../../utils/constants';
import { IGroupService } from '../interfaces/groups';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class GroupMessagesService implements IGroupMessageService {
    constructor(
        @InjectRepository(GroupMessage) private readonly groupMessageRepository: Repository<GroupMessage>,
        @Inject(Services.GROUPS) private readonly groupService: IGroupService,
        @InjectRepository(Group) private readonly groupRepository: Repository<Group>,
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
        const savedMessage = await this.groupMessageRepository.save(groupMessage);
        group.lastMessageSent = savedMessage;
        const updatedGroup = await this.groupService.saveGroup(group);
        return { message: savedMessage, group: updatedGroup };
    }
    async getGroupMessages(params: getGroupMessagesParams) {
        const { author, id } = params;
        const group = await this.groupService.getGroupById({ id, userId: author.id });
        if (!group) throw new HttpException('No Group Found to Get GroupMessage', HttpStatus.BAD_REQUEST);
        const existUser = group.users.find((user) => user.id == author.id);
        if (!existUser) throw new HttpException('User not in Group !Cant get Messages', HttpStatus.BAD_REQUEST);
        return await this.groupMessageRepository.find({
            where: { group: { id } },
            relations: ['author', 'author.profile'],
            order: {
                createdAt: 'DESC',
            },
        });
    }

    async deleteGroupMessage(params: DeleteGroupMessageParams) {
        const { userId, groupId, messageId } = params;
        const group = await this.groupRepository
            .createQueryBuilder('group')
            .where('id = :groupId', { groupId: groupId })
            .leftJoinAndSelect('group.lastMessageSent', 'lastMessageSent')
            .leftJoinAndSelect('group.messages', 'message')
            .leftJoinAndSelect('group.owner', 'owner')
            .leftJoinAndSelect('owner.profile', 'ownerProfile')
            .where('group.id = :groupId', {
                conversationId: groupId,
            })
            .orderBy('message.createdAt', 'DESC')
            .limit(5)
            .getOne();

        if (!group) throw new HttpException('Group not found', HttpStatus.BAD_REQUEST);

        const message = await this.groupMessageRepository.findOne({
            id: messageId,
            author: { id: userId },
            group: {
                id: groupId,
            },
        });

        const messages = await this.groupMessageRepository.find({
            where: {
                group: {
                    id: groupId,
                },
            },
            order: {
                createdAt: 'DESC',
            },
        });

        if (!message) throw new HttpException('Cannot delete message', HttpStatus.BAD_REQUEST);

        if (group.lastMessageSent.id !== message.id) {
            await this.groupMessageRepository.delete({ id: messageId });
            return messages;
        }

        const size = group.messages.length;
        const SECOND_GROUP_MESSAGE_INDEX = 1;
        if (size <= 1) {
            console.log('Last Message Sent is deleted');
            await this.groupRepository.update(
                {
                    id: groupId,
                },
                {
                    lastMessageSent: null,
                },
            );
            await this.groupMessageRepository.delete({ id: messageId });
            return messages;
        } else {
            console.log('There are more than 1 message');
            const newLastMessage = group.messages[SECOND_GROUP_MESSAGE_INDEX];
            await this.groupRepository.update(
                {
                    id: groupId,
                },
                {
                    lastMessageSent: newLastMessage,
                },
            );
            await this.groupMessageRepository.delete({ id: messageId });
            return messages;
        }
    }

    async editGroupMessage(params: EditGroupMessageParams) {
        const { userId, messageId, groupId, content } = params;
        const messageDB = await this.groupMessageRepository.findOne({
            where: {
                id: messageId,
                author: {
                    id: userId,
                },
                group: {
                    id: groupId,
                },
            },
            relations: ['group', 'group.creator', 'group.users', 'author', 'author.profile', 'group.creator.profile'],
        });

        if (!messageDB) throw new HttpException('Cannot Edit Group Message', HttpStatus.BAD_REQUEST);
        messageDB.content = content;

        return this.groupMessageRepository.save(messageDB);
    }
}
