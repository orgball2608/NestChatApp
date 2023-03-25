import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserService } from '../users/interfaces/user';
import { Services } from '../utils/constants';
import { Conversation, ConversationNickname, User } from '../utils/typeorm';
import {
    AccessParams,
    ChangeConversationNicknameParams,
    ChangeConversationThemeParams,
    ChangeEmojiIconParams,
    CreateConversationParams,
} from '../utils/types';
import { IConversationsService } from './conversations';
import { ConversationNotFoundException } from './exceptions/ConversationNotFound';

@Injectable()
export class ConversationsService implements IConversationsService {
    constructor(
        @InjectRepository(Conversation)
        private readonly conversationRepository: Repository<Conversation>,
        @InjectRepository(ConversationNickname)
        private readonly nicknameRepository: Repository<ConversationNickname>,
        @Inject(Services.USERS)
        private readonly userService: IUserService,
    ) {}

    async getConversations(id: number): Promise<Conversation[]> {
        return this.conversationRepository
            .createQueryBuilder('conversation')
            .leftJoinAndSelect('conversation.lastMessageSent', 'lastMessageSent')
            .leftJoinAndSelect('lastMessageSent.attachments', 'attachments')
            .leftJoinAndSelect('lastMessageSent.author', 'author')
            .leftJoinAndSelect('lastMessageSent.messageStatuses', 'status')
            .leftJoinAndSelect('status.user', 'seenBy')
            .leftJoinAndSelect('conversation.creator', 'creator')
            .leftJoinAndSelect('creator.peer', 'creatorPeer')
            .leftJoinAndSelect('creator.profile', 'creatorProfile')
            .leftJoinAndSelect('conversation.recipient', 'recipient')
            .leftJoinAndSelect('recipient.peer', 'recipientPeer')
            .leftJoinAndSelect('recipient.profile', 'recipientProfile')
            .leftJoinAndSelect('conversation.nicknames', 'nicknames')
            .leftJoinAndSelect('nicknames.user', 'userNickname')
            .where('creator.id = :id', { id })
            .orWhere('recipient.id = :id', { id })
            .orderBy('conversation.lastMessageSentAt', 'DESC')
            .getMany();
    }

    findConversationById(id: number): Promise<Conversation> {
        return this.conversationRepository.findOne({
            where: {
                id,
            },
            relations: [
                'lastMessageSent',
                'lastMessageSent.attachments',
                'lastMessageSent.messageStatuses',
                'lastMessageSent.messageStatuses.user',
                'creator',
                'recipient',
                'creator.profile',
                'recipient.profile',
                'nicknames',
                'nicknames.user',
            ],
        });
    }

    async createConversation(user: User, params: CreateConversationParams) {
        const { email } = params;

        const recipient = await this.userService.findUser({ email });

        if (!recipient) throw new HttpException('Cannot Create Conversation', HttpStatus.BAD_REQUEST);

        const existingConversation = await this.conversationRepository.findOne({
            where: [
                {
                    creator: { id: user.id },
                    recipient: { id: recipient.id },
                },
                {
                    creator: { id: recipient.id },
                    recipient: { id: user.id },
                },
            ],
        });

        if (existingConversation) throw new HttpException('Conversation exists', HttpStatus.CONFLICT);

        const conversation = this.conversationRepository.create({
            creator: user,
            recipient: recipient,
        });

        return this.conversationRepository.save(conversation);
    }

    async hasAccess({ id, userId }: AccessParams) {
        const conversation = await this.findConversationById(id);
        if (!conversation) throw new ConversationNotFoundException();
        return conversation.creator.id === userId || conversation.recipient.id === userId;
    }

    async changeEmojiIcon(params: ChangeEmojiIconParams): Promise<Conversation> {
        const { id, emoji } = params;
        const conversation = await this.findConversationById(id);
        if (!conversation) throw new ConversationNotFoundException();
        conversation.emoji = emoji;
        return this.conversationRepository.save(conversation);
    }

    async changeNickname(params: ChangeConversationNicknameParams): Promise<Conversation> {
        const { email, conversationId, nickname } = params;
        const conversation = await this.findConversationById(conversationId);
        if (!conversation) throw new ConversationNotFoundException();
        const user = await this.userService.findUser({ email });
        if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        const nicknameEntity = conversation.nicknames.find((nickname) => nickname.user.id === user.id);
        if (nicknameEntity) {
            nicknameEntity.nickname = nickname;
            conversation.nicknames = conversation.nicknames.filter((nickname) => nickname.user.id !== user.id);
            await this.nicknameRepository.save(nicknameEntity);
            conversation.nicknames.push(nicknameEntity);
        } else {
            const newNickname = this.nicknameRepository.create({
                conversation,
                user,
                nickname,
            });
            await this.nicknameRepository.save(newNickname);
            conversation.nicknames.push(newNickname);
        }
        return this.conversationRepository.save(conversation);
    }

    async changeConversationTheme(params: ChangeConversationThemeParams): Promise<Conversation> {
        const { id, theme } = params;
        const conversation = await this.findConversationById(id);
        if (!conversation) throw new ConversationNotFoundException();
        conversation.theme = theme;
        return this.conversationRepository.save(conversation);
    }

    async isCreated(userId: number, recipientId: number) {
        return this.conversationRepository.findOne({
            where: [
                {
                    creator: { id: userId },
                    recipient: { id: recipientId },
                },
                {
                    creator: { id: recipientId },
                    recipient: { id: userId },
                },
            ],
        });
    }
}
