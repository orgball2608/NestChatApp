import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { IAttachmentService } from '../attachments/attachments';
import { Services } from '../utils/constants';
import { Repository } from 'typeorm';
import { Conversation, Message } from '../utils/typeorm';
import {
    CreateGifMessageParams,
    CreateMessageParams,
    CreateMessageResponse,
    CreateReplyMessageParams,
    CreateStickerMessageParams,
    DeleteMessageParams,
    EditMessageParams,
} from '../utils/types';
import { IMessageService } from './messages';
@Injectable()
export class MessagesService implements IMessageService {
    constructor(
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
        @InjectRepository(Conversation)
        private readonly conversationRepository: Repository<Conversation>,
        @Inject(Services.ATTACHMENTS) private readonly attachmentsService: IAttachmentService,
    ) {}

    async createMessage({ user, content, conversationId, attachments, type }: CreateMessageParams) {
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId },
            relations: ['creator', 'recipient', 'lastMessageSent', 'creator.profile', 'recipient.profile'],
        });
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
            ],
            where: { conversation: { id: conversationId } },
            order: { createdAt: 'DESC' },
            withDeleted: true,
        });
    }

    async deleteMessage(params: DeleteMessageParams) {
        const conversation = await this.conversationRepository
            .createQueryBuilder('conversation')
            .where('id = :conversationId', { conversationId: params.conversationId })
            .leftJoinAndSelect('conversation.lastMessageSent', 'lastMessageSent')
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
            ],
        });
    }

    save(message: Message): Promise<Message> {
        return this.messageRepository.save(message);
    }

    async createGifMessage(params: CreateGifMessageParams): Promise<CreateMessageResponse> {
        const { user, gif, conversationId } = params;
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId },
            relations: ['creator', 'recipient', 'lastMessageSent', 'creator.profile', 'recipient.profile'],
        });
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
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId },
            relations: ['creator', 'recipient', 'lastMessageSent', 'creator.profile', 'recipient.profile'],
        });
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
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId },
            relations: ['creator', 'recipient', 'lastMessageSent', 'creator.profile', 'recipient.profile'],
        });
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
}
