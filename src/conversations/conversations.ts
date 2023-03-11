import { Conversation, User } from '../utils/typeorm';
import {
    AccessParams,
    ChangeConversationNicknameParams,
    ChangeConversationThemeParams,
    ChangeEmojiIconParams,
    CreateConversationParams,
} from '../utils/types';

export interface IConversationsService {
    createConversation(user: User, conversationParams: CreateConversationParams): Promise<Conversation>;
    getConversations(id: number): Promise<Conversation[]>;
    findConversationById(id: number): Promise<Conversation | undefined>;
    hasAccess({ id, userId }: AccessParams);
    changeEmojiIcon(params: ChangeEmojiIconParams): Promise<Conversation>;
    changeNickname(params: ChangeConversationNicknameParams): Promise<Conversation>;
    changeConversationTheme(params: ChangeConversationThemeParams): Promise<Conversation>;
}
