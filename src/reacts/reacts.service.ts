import { HttpCode, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IGroupMessageService } from 'src/groups/interfaces/group-messages';
import { IMessageService } from 'src/messages/messages';
import { Services } from 'src/utils/constants';
import { ReactGroupMessage, ReactMessage } from 'src/utils/typeorm';
import {
    CreateReactGroupMessageParams,
    CreateReactGroupMessagePayload,
    CreateReactMessageParams,
    CreateReactMessagePayload,
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
                message,
                author: user,
            },
        });

        if (isReacted) {
            isReacted.type = type;
            const savedReacted = await this.reactMessageRepository.save(isReacted);
            message.reacts = message.reacts.map((react) => {
                if (react.id === savedReacted.id) {
                    return savedReacted;
                }
                return react;
            });
        } else {
            const reactMessage = this.reactMessageRepository.create({
                author: user,
                message,
                type,
            });
            message.reacts = [...message.reacts, reactMessage];
            await this.reactMessageRepository.save(reactMessage);
        }

        const savedMessage = await this.messageService.save(message);
        return {
            message: savedMessage,
            conversationId,
        };
    }
    async findById(id: number): Promise<ReactMessage> {
        return this.reactMessageRepository.findOne(id);
    }

    async createReactGroupMessage(params: CreateReactGroupMessageParams): Promise<CreateReactGroupMessagePayload> {
        const { user, messageId, type, groupId } = params;
        const groupMessage = await this.groupMessageService.getGroupMessageById(messageId);
        if (!groupMessage) throw new HttpException('Group Message not found', HttpStatus.BAD_REQUEST);
        const isReacted = await this.reactGroupMessageRepository.findOne({
            where: {
                message: groupMessage,
                author: user,
            },
        });

        if (isReacted) {
            isReacted.type = type;
            const savedReacted = await this.reactGroupMessageRepository.save(isReacted);
            groupMessage.reacts = groupMessage.reacts.map((react: ReactGroupMessage) => {
                if (react.id === savedReacted.id) {
                    return savedReacted;
                }
                return react;
            });
        } else {
            const reactMessage = this.reactGroupMessageRepository.create({
                author: user,
                message: groupMessage,
                type,
            });
            groupMessage.reacts = [...groupMessage.reacts, reactMessage];
            await this.reactGroupMessageRepository.save(reactMessage);
        }

        const savedMessage = await this.groupMessageService.save(groupMessage);
        return {
            message: savedMessage,
            groupId,
        };
    }
}
