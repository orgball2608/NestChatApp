import { Conversation, Group, GroupMessage, Message, User } from './typeorm';
import { Request } from 'express';

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

export type DeleteGroupMessageParams = {
    userId: number;
    groupId: number;
    messageId: number;
};

export type EditGroupMessageParams = {
    userId: number;
    groupId: number;
    messageId: number;
    content: string;
};

export type AddGroupRecipientParams = {
    groupId: number;
    email: string;
    userId: number;
};

export type RemoveGroupRecipientParams = {
    groupId: number;
    removeUserId: number;
    userId: number;
};

export type ActionGroupRecipientResponse = {
    group: Group;
    user: User;
};

export type AddGroupUserResponse = {
    user: User;
    group: Group;
};

export type EditGroupTitleParams = {
    userId: number;
    groupId: number;
    title: string;
};

export type ImagePermission = 'public-read' | 'private';
export type UploadImageParams = {
    key: string;
    file: Express.Multer.File;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Attachment extends Express.Multer.File {}

export type AccessParams = {
    id: number;
    userId: number;
};

export type changeOwnerParams = {
    groupId: number;
    newOwnerId: number;
    userId: number;
};

export type leaveGroupParams = {
    groupId: number;
    userId: number;
};

export type CheckUserInGroupParams = {
    groupId: number;
    userId: number;
};

export type FriendStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';

export type CreateFriendRequestParams = {
    user: User;
    email: string;
};

export type AcceptRequestParams = {
    id: number;
    userId: number;
};

export type DeleteFriendParams = {
    userId: number;
    removeUserId: number;
};

export type GetFriendParams = {
    userId: number;
    friendId: number;
};

export type CancelRequestParams = {
    userId: number;
    requestId: number;
};

export type RejectRequestParams = {
    receiverId: number;
    requestId: number;
};
