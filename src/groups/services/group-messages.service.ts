import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IGroupMessageService } from '../interfaces/group-messages';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation, Group, GroupMessage, Message } from '../../utils/typeorm';
import { Repository } from 'typeorm';
import {
    CreateGroupGifMessageParams,
    CreateGroupMessageParams,
    CreateGroupMessageResponse,
    CreateGroupStickerMessageParams,
    CreateReplyGroupMessageParams,
    DeleteGroupMessageParams,
    EditGroupMessageParams,
    ForwardMessageParams,
    getGroupMessagesParams,
    getGroupMessagesWithLimitParams,
} from '../../utils/types';
import { Services } from '../../utils/constants';
import { IGroupService } from '../interfaces/groups';
import { instanceToPlain } from 'class-transformer';
import { IAttachmentService } from 'src/attachments/attachments';

@Injectable()
export class GroupMessagesService implements IGroupMessageService {
    constructor(
        @InjectRepository(GroupMessage) private readonly groupMessageRepository: Repository<GroupMessage>,
        @Inject(Services.GROUPS) private readonly groupService: IGroupService,
        @InjectRepository(Group) private readonly groupRepository: Repository<Group>,
        @Inject(Services.ATTACHMENTS) private readonly attachmentsService: IAttachmentService,
        @InjectRepository(Conversation)
        private readonly conversationRepository: Repository<Conversation>,
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
    ) {}

    async createGroupMessage(params: CreateGroupMessageParams) {
        const { author, groupId, content, attachments, type } = params;
        const group = await this.groupService.getGroupById({ id: groupId, userId: author.id });
        if (!group) throw new HttpException('No Group Found to Create Group Message', HttpStatus.BAD_REQUEST);
        const existUser = group.users.find((user) => user.id == author.id);
        if (!existUser) throw new HttpException('User not in Group !Cant create Message', HttpStatus.BAD_REQUEST);
        const newAttachments = attachments
            ? await this.attachmentsService.createGroupAttachments(attachments, type)
            : [];

        const groupMessage = this.groupMessageRepository.create({
            author: instanceToPlain(author),
            group,
            content,
            attachments: newAttachments,
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
            relations: [
                'author',
                'author.profile',
                'attachments',
                'reacts',
                'reacts.author',
                'reacts.author.profile',
                'reply',
                'reply.attachments',
                'messageStatuses',
                'messageStatuses.user',
            ],
            order: {
                createdAt: 'DESC',
            },
            withDeleted: true,
        });
    }

    async getGroupMessagesWithLimit(params: getGroupMessagesWithLimitParams) {
        const { author, id, limit, offset } = params;
        const group = await this.groupService.getGroupById({ id, userId: author.id });
        if (!group) throw new HttpException('No Group Found to Get GroupMessage', HttpStatus.BAD_REQUEST);
        const existUser = group.users.find((user) => user.id == author.id);
        if (!existUser) throw new HttpException('User not in Group !Cant get Messages', HttpStatus.BAD_REQUEST);
        return await this.groupMessageRepository.find({
            where: { group: { id } },
            relations: [
                'author',
                'author.profile',
                'attachments',
                'reacts',
                'reacts.author',
                'reacts.author.profile',
                'reply',
                'reply.attachments',
                'messageStatuses',
                'messageStatuses.user',
            ],
            order: {
                createdAt: 'DESC',
            },
            take: limit,
            skip: offset,
            withDeleted: true,
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
            await this.groupMessageRepository.softDelete({ id: messageId });
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
            await this.groupMessageRepository.softDelete({ id: messageId });
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
            await this.groupMessageRepository.softDelete({ id: messageId });
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

    getGroupMessageById(id: number) {
        return this.groupMessageRepository.findOne({
            where: { id },
            relations: [
                'author',
                'author.profile',
                'attachments',
                'reacts',
                'reacts.author',
                'reacts.author.profile',
                'reply',
                'reply.attachments',
                'messageStatuses',
                'messageStatuses.user',
            ],
        });
    }

    save(message: GroupMessage): Promise<GroupMessage> {
        return this.groupMessageRepository.save(message);
    }

    async createGroupGifMessage(params: CreateGroupGifMessageParams) {
        const { author, groupId, gif } = params;
        const group = await this.groupService.getGroupById({ id: groupId, userId: author.id });
        if (!group) throw new HttpException('No Group Found to Create Group Message', HttpStatus.BAD_REQUEST);
        const existUser = group.users.find((user) => user.id == author.id);
        if (!existUser) throw new HttpException('User not in Group !Cant create Message', HttpStatus.BAD_REQUEST);

        const groupMessage = this.groupMessageRepository.create({
            author: instanceToPlain(author),
            group,
            gif,
            attachments: [],
        });
        const savedMessage = await this.groupMessageRepository.save(groupMessage);
        group.lastMessageSent = savedMessage;
        const updatedGroup = await this.groupService.saveGroup(group);
        return { message: savedMessage, group: updatedGroup };
    }

    async createGroupStickerMessage(params: CreateGroupStickerMessageParams) {
        const { author, groupId, sticker } = params;
        const group = await this.groupService.getGroupById({ id: groupId, userId: author.id });
        if (!group) throw new HttpException('No Group Found to Create Group Message', HttpStatus.BAD_REQUEST);
        const existUser = group.users.find((user) => user.id == author.id);
        if (!existUser) throw new HttpException('User not in Group !Cant create Message', HttpStatus.BAD_REQUEST);

        const groupMessage = this.groupMessageRepository.create({
            author: instanceToPlain(author),
            group,
            sticker,
            attachments: [],
        });
        const savedMessage = await this.groupMessageRepository.save(groupMessage);
        group.lastMessageSent = savedMessage;
        const updatedGroup = await this.groupService.saveGroup(group);
        return { message: savedMessage, group: updatedGroup };
    }

    async createReplyGroupMessage(params: CreateReplyGroupMessageParams): Promise<CreateGroupMessageResponse> {
        const { messageId, groupId, content, user } = params;
        const group = await this.groupService.getGroupById({ id: groupId, userId: user.id });
        if (!group) throw new HttpException('No Group Found to Create Group Message', HttpStatus.BAD_REQUEST);
        const existUser = group.users.find((u) => u.id == user.id);
        if (!existUser) throw new HttpException('User not in Group !Cant create Message', HttpStatus.BAD_REQUEST);

        const message = await this.groupMessageRepository.findOne({
            where: {
                id: messageId,
            },
            relations: [
                'author',
                'author.profile',
                'attachments',
                'reacts',
                'reacts.author',
                'messageStatuses',
                'messageStatuses.user',
            ],
        });

        if (!message) throw new HttpException('Message not found', HttpStatus.BAD_REQUEST);

        const groupMessage = this.groupMessageRepository.create({
            author: instanceToPlain(user),
            group,
            content,
            reply: message,
            attachments: [],
        });
        const savedMessage = await this.groupMessageRepository.save(groupMessage);
        group.lastMessageSent = savedMessage;
        const updatedGroup = await this.groupService.saveGroup(group);
        return { message: savedMessage, group: updatedGroup };
    }

    async getGroupMessagesLength(id: number): Promise<number> {
        return this.groupMessageRepository.count({
            where: { group: { id } },
            withDeleted: true,
        });
    }

    async forwardGroupMessage(params: ForwardMessageParams) {
        const { author, id, messageId } = params;
        const group = await this.groupService.getGroupById({ id, userId: author.id });
        if (!group) throw new HttpException('No Group Found to Create Group Message', HttpStatus.BAD_REQUEST);
        const existUser = group.users.find((user) => user.id == author.id);
        if (!existUser) throw new HttpException('User not in Group !Cant create Message', HttpStatus.BAD_REQUEST);

        const forwardedMessage = await this.getGroupMessageById(messageId);
        if (!forwardedMessage) throw new HttpException('Message not found', HttpStatus.BAD_REQUEST);
        const newAttachments =
            forwardedMessage.attachments.length === 0
                ? []
                : await this.attachmentsService.copyGroupAttachments(forwardedMessage.attachments);

        const message = this.groupMessageRepository.create({
            content: forwardedMessage?.content,
            author: author,
            gif: forwardedMessage?.gif,
            sticker: forwardedMessage?.sticker,
            group: group,
            attachments: newAttachments,
        });
        const savedMessage = await this.groupMessageRepository.save(message);
        group.lastMessageSent = savedMessage;
        const updatedGroup = await this.groupService.saveGroup(group);
        return { message: savedMessage, group: updatedGroup };
    }

    async forwardConversationMessage(params: ForwardMessageParams) {
        const { author, id, messageId } = params;
        const conversation = await this.conversationRepository.findOne({
            where: {
                id,
            },
            relations: [
                'lastMessageSent',
                'creator',
                'recipient',
                'creator.profile',
                'recipient.profile',
                'nicknames',
                'nicknames.user',
            ],
        });
        if (!conversation) throw new HttpException('No Conversation Found', HttpStatus.BAD_REQUEST);
        const forwardedMessage = await this.getGroupMessageById(messageId);
        if (!forwardedMessage) throw new HttpException('Message not found', HttpStatus.BAD_REQUEST);
        const newAttachments =
            forwardedMessage.attachments.length === 0
                ? []
                : await this.attachmentsService.copyAttachments(forwardedMessage.attachments);

        const message = this.messageRepository.create({
            content: forwardedMessage?.content,
            author: author,
            gif: forwardedMessage?.gif,
            sticker: forwardedMessage?.sticker,
            conversation: conversation,
            attachments: newAttachments,
        });
        const savedMessage = await this.messageRepository.save(message);
        conversation.lastMessageSent = savedMessage;
        const updatedConversation = await this.conversationRepository.save(conversation);
        return { message: savedMessage, conversation: updatedConversation };
    }
}
