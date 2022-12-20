import { CreateConversationParams } from '../utils/types';
import {Conversation, User} from "../utils/typeorm";

export interface IConversationsService {
    createConversation(user: User, conversationParams: CreateConversationParams): Promise<Conversation>;

    find(id: number): any;
    findConversationById(id: number): Promise<Conversation>;
    findConversationByParticipants(ids: number[]): Promise<Conversation>;
}