import { Message } from '../utils/typeorm';
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
} from '../utils/types';

export interface IMessageService {
    createMessage(params: CreateMessageParams): Promise<CreateMessageResponse>;

    createGifMessage(params: CreateGifMessageParams): Promise<CreateMessageResponse>;

    createStickerMessage(params: CreateStickerMessageParams): Promise<CreateMessageResponse>;

    getMessagesByConversationId(conversationId: number): Promise<Message[]>;

    getMessagesWithLimit(params: getConversationMessagesParams): Promise<Message[]>;

    getMessageById(messageId: number): Promise<Message>;

    deleteMessage(params: DeleteMessageParams);

    editMessage(params: EditMessageParams): Promise<Message>;

    save(message: Message): Promise<Message>;

    createReplyMessage(params: CreateReplyMessageParams): Promise<CreateMessageResponse>;

    getMessagesLengthByConversationId(conversationId: number): Promise<number>;

    searchMessagesByContent(params: SearchMessagesByContentParams): Promise<Message[]>;

    forwardConversationMessage(params: ForwardMessageParams);

    forwardGroupMessage(params: ForwardMessageParams);

    getMessageAttachments(conversationId: number);
}
