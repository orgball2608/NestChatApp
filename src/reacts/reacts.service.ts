import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IGroupMessageService } from 'src/groups/interfaces/group-messages';
import { IMessageService } from 'src/messages/interfaces/messages';
import { Services } from 'src/utils/constants';
import { ReactGroupMessage, ReactMessage } from 'src/utils/typeorm';
import {
    CreateReactGroupMessageParams,
    CreateReactGroupMessagePayload,
    CreateReactMessageParams,
    CreateReactMessagePayload,
    RemoveReactMessageParams,
    RemoveReactMessagePayload,
} from 'src/utils/types';
import { Repository } from 'typeorm';
import { IReactService } from './reacts';

@Injectable()
export class ReactsService implements IReactService {
    constructor(
        @InjectRepository(ReactMessage) private reactMessageRepository: Repository<ReactMessage>,
        @InjectRepository(ReactGroupMessage) private reactGroupMessageRepository: Repository<ReactGroupMessage>,
        @Inject(Services.MESSAGES) private messageService: IMessageService,
        @Inject(Services.GROUP_MESSAGES) private groupMessageService: IGroupMessageService,
    ) {}

    async createReactMessage(params: CreateReactMessageParams): Promise<CreateReactMessagePayload> {
        const { user, messageId, type, conversationId } = params;
        const message = await this.messageService.getMessageById(messageId);
        if (!message) throw new HttpException('Message not found', HttpStatus.BAD_REQUEST);

        const isReacted = await this.reactMessageRepository.findOne({
            where: {
                message: { id: message.id },
                author: { id: user.id },
            },
            relations: ['author'],
        });

        if (isReacted) {
            isReacted.type = type;
            await this.reactMessageRepository.save(isReacted);
        } else {
            const newReactMessage = this.reactMessageRepository.create({
                author: user,
                message: message,
                type,
            });
            await this.reactMessageRepository.save(newReactMessage);
        }

        const updatedMessage = await this.messageService.getMessageById(messageId);
        if (!updatedMessage)
            throw new HttpException('Failed to retrieve updated message', HttpStatus.INTERNAL_SERVER_ERROR);

        return {
            message: updatedMessage,
            conversationId,
        };
    }

    async findById(id: number): Promise<ReactMessage | null> {
        return this.reactMessageRepository.findOneBy({ id });
    }

    async createReactGroupMessage(params: CreateReactGroupMessageParams): Promise<CreateReactGroupMessagePayload> {
        const { user, messageId, type, groupId } = params;
        const groupMessage = await this.groupMessageService.getGroupMessageById(messageId);
        if (!groupMessage) throw new HttpException('Group Message not found', HttpStatus.BAD_REQUEST);

        const isReacted = await this.reactGroupMessageRepository.findOne({
            where: {
                message: { id: groupMessage.id },
                author: { id: user.id },
            },
            relations: ['author'],
        });

        if (isReacted) {
            isReacted.type = type;
            await this.reactGroupMessageRepository.save(isReacted);
        } else {
            const newReactGroupMessage = this.reactGroupMessageRepository.create({
                author: user,
                message: groupMessage,
                type,
            });
            await this.reactGroupMessageRepository.save(newReactGroupMessage);
        }

        const updatedGroupMessage = await this.groupMessageService.getGroupMessageById(messageId);
        if (!updatedGroupMessage)
            throw new HttpException('Failed to retrieve updated group message', HttpStatus.INTERNAL_SERVER_ERROR);

        return {
            message: updatedGroupMessage,
            groupId,
        };
    }

    async removeReact(params: RemoveReactMessageParams): Promise<RemoveReactMessagePayload> {
        const { id: conversationId, messageId, user, reactId } = params;
        const message = await this.messageService.getMessageById(messageId);
        if (!message) throw new HttpException('Message not found', HttpStatus.BAD_REQUEST);

        const react = await this.reactMessageRepository.findOne({
            where: {
                id: reactId,
                author: { id: user.id },
            },
            relations: ['author'],
        });

        if (!react) throw new HttpException('React not found or you are not the author', HttpStatus.BAD_REQUEST);

        await this.reactMessageRepository.remove(react);

        const updatedMessage = await this.messageService.getMessageById(messageId);
        if (!updatedMessage)
            throw new HttpException(
                'Failed to retrieve updated message after removing react',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );

        return {
            message: updatedMessage,
            id: conversationId,
        };
    }

    async removeReactGroupMessage(params: RemoveReactMessageParams): Promise<RemoveReactMessagePayload> {
        const { id: groupId, messageId, user, reactId } = params;
        const groupMessage = await this.groupMessageService.getGroupMessageById(messageId);
        if (!groupMessage) throw new HttpException('Message not found', HttpStatus.BAD_REQUEST);

        const react = await this.reactGroupMessageRepository.findOne({
            where: {
                id: reactId,
                author: { id: user.id },
            },
            relations: ['author'],
        });

        if (!react) throw new HttpException('React not found or you are not the author', HttpStatus.BAD_REQUEST);

        await this.reactGroupMessageRepository.remove(react);

        const updatedGroupMessage = await this.groupMessageService.getGroupMessageById(messageId);
        if (!updatedGroupMessage)
            throw new HttpException(
                'Failed to retrieve updated group message after removing react',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );

        return {
            message: updatedGroupMessage,
            id: groupId,
        };
    }
}
