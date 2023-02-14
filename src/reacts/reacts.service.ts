import { HttpCode, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IMessageService } from 'src/messages/messages';
import { Services } from 'src/utils/constants';
import { ReactMessage } from 'src/utils/typeorm';
import { CreateReactMessageParams, CreateReactMessagePayload } from 'src/utils/types';
import { Repository } from 'typeorm';
import { IReactService } from './reacts';

@Injectable()
export class ReactsService implements IReactService {
    constructor(
        @InjectRepository(ReactMessage) private reactMessageRepository: Repository<ReactMessage>,
        @Inject(Services.MESSAGES) private messageService: IMessageService,
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
}
