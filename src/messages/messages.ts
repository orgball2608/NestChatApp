import { Message } from '../utils/typeorm';
import {
    CreateGifMessageParams,
    CreateMessageParams,
    CreateMessageResponse,
    CreateReplyMessageParams,
    CreateStickerMessageParams,
    DeleteMessageParams,
    EditMessageParams,
} from '../utils/types';

export interface IMessageService {
    createMessage(params: CreateMessageParams): Promise<CreateMessageResponse>;

    createGifMessage(params: CreateGifMessageParams): Promise<CreateMessageResponse>;

    createStickerMessage(params: CreateStickerMessageParams): Promise<CreateMessageResponse>;

    getMessagesByConversationId(conversationId: number): Promise<Message[]>;

    getMessageById(messageId: number): Promise<Message>;

    deleteMessage(params: DeleteMessageParams);

    editMessage(params: EditMessageParams): Promise<Message>;

    save(message: Message): Promise<Message>;

    createReplyMessage(params: CreateReplyMessageParams): Promise<CreateMessageResponse>;
}
