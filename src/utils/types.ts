import { Conversation, Group, GroupMessage, Message, User } from './typeorm';

export type CreateUserDetails = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
};

export type ValidateUserDetails = {
    email: string;
    password: string;
};

export type FindUserParams = Partial<{
    id: number;
    email: string;
}>;

export type CreateConversationParams = {
    email: string;
    message: string;
};

export interface AuthenticatedRequest extends Request {
    user: User;
}

export type CreateMessageParams = {
    content: string;
    conversationId: number;
    user: User;
};

export type CreateMessageResponse = {
    message: Message;
    conversation: Conversation;
};

export type DeleteMessageParams = {
    userId: number;
    conversationId: number;
    messageId: number;
};

export type EditMessageParams = {
    userId: number;
    conversationId: number;
    messageId: number;
    content: string;
};

export type CreateGroupParams = {
    creator: User;
    title?: string;
    users: string[];
};

export type GetGroupsParams = {
    userId: number;
};

export type GetGroupsByIdParams = {
    id: number;
    userId: number;
};

export type CreateGroupMessageParams = {
    groupId: number;
    content: string;
    author: User;
};

export type CreateGroupMessageResponse = {
    message: GroupMessage;
    group: Group;
};

export type FindUserSelectOption = Partial<{
    selectAll: boolean;
}>;

export type getGroupMessagesParams = {
    id: number;
    author: User;
};

export type getGroupMessagesResponse = {
    id: number;
    messages: GroupMessage[];
};
