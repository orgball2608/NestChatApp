import { CreateConversationParams } from '../utils/types';
import {User} from "../utils/typeorm";

export interface IConversationsService {
    createConversation(user: User, conversationParams: CreateConversationParams);
}