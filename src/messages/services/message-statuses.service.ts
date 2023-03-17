import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation, Message, MessageStatus } from '../../utils/typeorm';
import { Repository } from 'typeorm';
import { IMessageStatusService } from '../interfaces/message-statuses';
import { UpdateMessageStatus, UpdateMessageStatusPayload } from '../../utils/types';
import { Services } from '../../utils/constants';
import { IMessageService } from '../interfaces/messages';

@Injectable()
export class MessageStatusesService implements IMessageStatusService {
    constructor(
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
        @InjectRepository(Conversation)
        private readonly conversationRepository: Repository<Conversation>,
        @InjectRepository(MessageStatus)
        private readonly messageStatusRepository: Repository<MessageStatus>,
        @Inject(Services.MESSAGES) private readonly messageService: IMessageService,
    ) {}

    async updateMessageStatus(params: UpdateMessageStatus): Promise<UpdateMessageStatusPayload> {
        const { author, conversationId, messageId } = params;
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId },
            relations: [
                'creator',
                'recipient',
                'lastMessageSent',
                'creator.profile',
                'recipient.profile',
                'nicknames',
                'nicknames.user',
                'nicknames.user.profile',
            ],
        });
        if (!conversation) throw new HttpException('Conversation not found', HttpStatus.BAD_REQUEST);
        const { creator, recipient } = conversation;

        if (creator.id !== author.id && recipient.id !== author.id)
            throw new HttpException('Cannot Create Message', HttpStatus.FORBIDDEN);

        const message = await this.messageService.getMessageById(messageId);
        if (!message) throw new HttpException('Cannot Find Message', HttpStatus.BAD_REQUEST);
        const existStatus = message.messageStatuses.find((status) => status.user.id === author.id);
        if (existStatus)
            return {
                conversationId,
                message,
            };
        const messageStatus = this.messageStatusRepository.create({
            user: author,
            message,
            seen: true,
        });
        const savedMessageStatus = await this.messageStatusRepository.save(messageStatus);
        message.messageStatuses.push(savedMessageStatus);
        const savedMessage = await this.messageRepository.save(message);
        return {
            conversationId,
            message: savedMessage,
        };
    }
}
