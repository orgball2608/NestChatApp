import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { IAttachmentService } from '../../attachments/attachments';
import { Services } from '../../utils/constants';
import { Repository } from 'typeorm';
import { Conversation, Group, GroupMessage, Message } from '../../utils/typeorm';
import {
    CreateGifMessageParams,
    CreateMessageParams,
    CreateMessageResponse,
    CreateReplyMessageParams,
    CreateStickerMessageParams,
    DeleteMessageParams,
    EditMessageParams,
    ForwardMessageParams,
    getConversationMessagesParams,
    SearchMessagesByContentParams,
} from '../../utils/types';
import { IMessageService } from '../interfaces/messages';
import { GroupNotFoundException } from 'src/groups/exceptions/GroupNotFoundException';
import { IConversationsService } from '../../conversations/conversations';

@Injectable()
export class MessagesService implements IMessageService {
    constructor(
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
        @InjectRepository(GroupMessage)
        private readonly groupMessageRepository: Repository<GroupMessage>,
        @InjectRepository(Group)
        private readonly groupRepository: Repository<Group>,
        @InjectRepository(Conversation)
        private readonly conversationRepository: Repository<Conversation>,
        @Inject(Services.ATTACHMENTS) private readonly attachmentsService: IAttachmentService,
        @Inject(Services.CONVERSATIONS) private readonly conversationService: IConversationsService,
    ) {}

    async createMessage({ user, content, conversationId, attachments, type }: CreateMessageParams) {
        const conversation = await this.conversationService.findConversationById(conversationId);
        if (!conversation) throw new HttpException('Conversation not found', HttpStatus.BAD_REQUEST);

        const { creator, recipient } = conversation;

        if (creator.id !== user.id && recipient.id !== user.id)
            throw new HttpException('Cannot Create Message', HttpStatus.FORBIDDEN);

        const newAttachments = attachments ? await this.attachmentsService.create(attachments, type) : [];

        const message = this.messageRepository.create({
            content,
            conversation,
            author: instanceToPlain(user),
            attachments: newAttachments,
        });
        const savedMessage = await this.messageRepository.save(message);
        conversation.lastMessageSent = savedMessage;
        const updatedConversation = await this.conversationRepository.save(conversation);
        return { message: savedMessage, conversation: updatedConversation };
    }

    getMessagesByConversationId(conversationId: number): Promise<Message[]> {
        return this.messageRepository.find({
            relations: [
                'author',
                'author.profile',
                'attachments',
                'reacts',
                'reacts.author',
                'reacts.author.profile',
                'reply',
                'reply.author',
                'reply.author.profile',
                'reply.attachments',
                'messageStatuses',
                'messageStatuses.user',
            ],
            where: { conversation: { id: conversationId } },
            order: { createdAt: 'DESC' },
            withDeleted: true,
        });
    }

    getMessagesLengthByConversationId(conversationId: number): Promise<number> {
        return this.messageRepository.count({ conversation: { id: conversationId } });
    }

    async getMessagesWithLimit(params: getConversationMessagesParams): Promise<Message[]> {
        const { conversationId, limit, offset } = params;
        return this.messageRepository.find({
            relations: [
                'author',
                'author.profile',
                'attachments',
                'reacts',
                'reacts.author',
                'reacts.author.profile',
                'reply',
                'reply.author',
                'reply.author.profile',
                'reply.attachments',
                'conversation',
                'messageStatuses',
                'messageStatuses.user',
            ],
            where: { conversation: { id: conversationId } },
            order: { createdAt: 'DESC' },
            withDeleted: true,
            take: limit,
            skip: offset,
        });
    }

    async deleteMessage(params: DeleteMessageParams) {
        const conversation = await this.conversationRepository
            .createQueryBuilder('conversation')
            .where('id = :conversationId', { conversationId: params.conversationId })
            .leftJoinAndSelect('conversation.lastMessageSent', 'lastMessageSent')
            .leftJoinAndSelect('lastMessageSent.messageStatuses', 'status')
            .leftJoinAndSelect('status.user', 'seenBy')
            .leftJoinAndSelect('conversation.messages', 'message')
            .where('conversation.id = :conversationId', {
                conversationId: params.conversationId,
            })
            .orderBy('message.createdAt', 'DESC')
            .limit(5)
            .getOne();

        if (!conversation) throw new HttpException('Conversation not found', HttpStatus.BAD_REQUEST);

        const message = await this.messageRepository.findOne({
            id: params.messageId,
            author: { id: params.userId },
            conversation: {
                id: params.conversationId,
            },
        });

        if (!message) throw new HttpException('Cannot delete message', HttpStatus.BAD_REQUEST);

        if (conversation.lastMessageSent.id !== message.id)
            return this.messageRepository.softDelete({ id: message.id });

        const size = conversation.messages.length;
        const SECOND_MESSAGE_INDEX = 1;
        if (size <= 1) {
            console.log('Last Message Sent is deleted');
            await this.conversationRepository.update(
                {
                    id: params.conversationId,
                },
                {
                    lastMessageSent: null,
                },
            );
            return this.messageRepository.softDelete({ id: params.messageId });
        } else {
            console.log('There are more than 1 message');
            const newLastMessage = conversation.messages[SECOND_MESSAGE_INDEX];
            await this.conversationRepository.update(
                {
                    id: params.conversationId,
                },
                {
                    lastMessageSent: newLastMessage,
                },
            );
            return this.messageRepository.softDelete({ id: params.messageId });
        }
    }

    async editMessage(params: EditMessageParams) {
        const message = await this.messageRepository.findOne({
            where: {
                id: params.messageId,
                author: { id: params.userId },
            },
            relations: ['conversation', 'conversation.creator', 'conversation.recipient', 'author'],
        });
        if (!message) throw new HttpException('Cannot Edit Message', HttpStatus.BAD_REQUEST);
        message.content = params.content;
        return this.messageRepository.save(message);
    }

    getMessageById(messageId: number): Promise<Message> {
        return this.messageRepository.findOne({
            where: { id: messageId },
            relations: [
                'author',
                'author.profile',
                'attachments',
                'reacts',
                'reacts.author',
                'reacts.author.profile',
                'reply',
                'reply.author',
                'reply.author.profile',
                'reply.attachments',
                'messageStatuses',
                'messageStatuses.user',
            ],
        });
    }

    save(message: Message): Promise<Message> {
        return this.messageRepository.save(message);
    }

    async createGifMessage(params: CreateGifMessageParams): Promise<CreateMessageResponse> {
        const { user, gif, conversationId } = params;
        const conversation = await this.conversationService.findConversationById(conversationId);
        if (!conversation) throw new HttpException('Conversation not found', HttpStatus.BAD_REQUEST);

        const { creator, recipient } = conversation;

        if (creator.id !== user.id && recipient.id !== user.id)
            throw new HttpException('Cannot Create Message', HttpStatus.FORBIDDEN);

        const message = this.messageRepository.create({
            gif,
            conversation,
            author: instanceToPlain(user),
            attachments: [],
        });
        const savedMessage = await this.messageRepository.save(message);
        conversation.lastMessageSent = savedMessage;
        const updatedConversation = await this.conversationRepository.save(conversation);
        return { message: savedMessage, conversation: updatedConversation };
    }

    async createStickerMessage(params: CreateStickerMessageParams): Promise<CreateMessageResponse> {
        const { user, sticker, conversationId } = params;
        const conversation = await this.conversationService.findConversationById(conversationId);
        if (!conversation) throw new HttpException('Conversation not found', HttpStatus.BAD_REQUEST);

        const { creator, recipient } = conversation;

        if (creator.id !== user.id && recipient.id !== user.id)
            throw new HttpException('Cannot Create Message', HttpStatus.FORBIDDEN);

        const message = this.messageRepository.create({
            sticker,
            conversation,
            author: instanceToPlain(user),
            attachments: [],
        });
        const savedMessage = await this.messageRepository.save(message);
        conversation.lastMessageSent = savedMessage;
        const updatedConversation = await this.conversationRepository.save(conversation);
        return { message: savedMessage, conversation: updatedConversation };
    }

    async createReplyMessage(params: CreateReplyMessageParams): Promise<CreateMessageResponse> {
        const { user, content, conversationId, messageId } = params;
        const conversation = await this.conversationService.findConversationById(conversationId);
        if (!conversation) throw new HttpException('Conversation not found', HttpStatus.BAD_REQUEST);

        const replyMessage = await this.messageRepository.findOne({
            where: { id: messageId },
            relations: ['author', 'author.profile', 'attachments'],
        });

        if (!replyMessage) throw new HttpException('Reply Message not found', HttpStatus.BAD_REQUEST);

        const { creator, recipient } = conversation;

        if (creator.id !== user.id && recipient.id !== user.id)
            throw new HttpException('Cannot Create Message', HttpStatus.FORBIDDEN);

        const message = this.messageRepository.create({
            content,
            conversation,
            author: instanceToPlain(user),
            attachments: [],
            reply: replyMessage,
        });
        const savedMessage = await this.messageRepository.save(message);
        conversation.lastMessageSent = savedMessage;
        const updatedConversation = await this.conversationRepository.save(conversation);
        return { message: savedMessage, conversation: updatedConversation };
    }

    searchMessagesByContent(params: SearchMessagesByContentParams): Promise<Message[]> {
        const { conversationId, content } = params;
        return this.messageRepository
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.author', 'author')
            .leftJoinAndSelect('author.profile', 'profile')
            .leftJoinAndSelect('message.attachments', 'attachments')
            .leftJoinAndSelect('message.reacts', 'reacts')
            .leftJoinAndSelect('reacts.author', 'reactAuthor')
            .leftJoinAndSelect('reactAuthor.profile', 'reactAuthorProfile')
            .leftJoinAndSelect('message.reply', 'reply')
            .leftJoinAndSelect('reply.author', 'replyAuthor')
            .leftJoinAndSelect('replyAuthor.profile', 'replyAuthorProfile')
            .leftJoinAndSelect('reply.attachments', 'replyAttachments')
            .where('message.conversationId = :conversationId', { conversationId })
            .andWhere('message.content LIKE :content', { content: `%${content}%` })
            .orderBy('message.createdAt', 'DESC')
            .getMany();
    }

    async forwardConversationMessage(params: ForwardMessageParams) {
        const { id, messageId, author } = params;
        const conversation = await this.conversationService.findConversationById(id);
        if (!conversation) throw new HttpException('Conversation not found', HttpStatus.BAD_REQUEST);

        const forwardedMessage = await this.getMessageById(messageId);
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

    async forwardGroupMessage(params: ForwardMessageParams) {
        const { id, messageId, author } = params;
        const group = await this.groupRepository.findOne({
            where: {
                id,
            },
            relations: [
                'creator',
                'users',
                'lastMessageSent',
                'lastMessageSent.messageStatuses',
                'lastMessageSent.messageStatuses.user',
                'owner',
                'creator.profile',
                'owner.profile',
                'users.profile',
                'nicknames',
                'nicknames.user',
            ],
        });
        if (!group) throw new GroupNotFoundException();

        const forwardedMessage = await this.getMessageById(messageId);
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
        const updatedGroup = await this.groupRepository.save(group);
        return { message: savedMessage, group: updatedGroup };
    }

    async getMessageAttachments(conversationId: number) {
        const messages = await this.getMessagesByConversationId(conversationId);
        const conversationAttachments = messages.map((message) => message.attachments);
        return conversationAttachments.filter((attachment) => attachment.length !== 0);
    }
}
