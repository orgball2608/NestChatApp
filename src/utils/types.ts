import { Attachment, Conversation, Friend, FriendRequest, Group, GroupMessage, Message, User } from './typeorm';
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
    content?: string;
    attachments?: AttachmentFile[];
    conversationId: number;
    user: User;
    type: string;
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
    attachments?: AttachmentFile[];
    type: string;
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

export type AddGroupRecipientsParams = {
    groupId: number;
    emails: string[];
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

export type AddGroupRecipientsResponse = {
    group: Group;
    users: User[];
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

export type UpdateProfileParams = Partial<{
    bio: string;
    banner: Express.Multer.File;
    avatar: Express.Multer.File;
    location: string;
}>;

export type FriendRequestAcceptedPayload = {
    friend: Friend;
    friendRequest: FriendRequest;
    user: User;
};

export type RemoveFriendEventPayload = {
    friend: Friend;
    userId: number;
};

export type UpdateGroupAvatarParams = {
    groupId: number;
    userId: number;
    avatar: Express.Multer.File;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AttachmentFile extends Express.Multer.File {}

export type uploadAttachmentParams = {
    file: AttachmentFile;
    attachment: Attachment;
};

export type ReactionType = 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry';

export type CreateReactMessageParams = {
    messageId: number;
    conversationId: number;
    user: User;
    type: ReactionType;
};

export type CreateReactMessagePayload = {
    message: Message;
    conversationId: number;
};

export type CreateReactGroupMessageParams = {
    messageId: number;
    groupId: number;
    user: User;
    type: ReactionType;
};

export type CreateReactGroupMessagePayload = {
    message: GroupMessage;
    groupId: number;
};

export type RemoveReactMessageParams = {
    messageId: number;
    reactId: number;
    user: User;
    id: number;
};

export type RemoveReactMessagePayload = {
    message: GroupMessage;
    id: number;
};

export type CreateGifMessageParams = {
    conversationId: number;
    user: User;
    gif: string;
};

export type CreateGroupGifMessageParams = {
    groupId: number;
    author: User;
    gif: string;
};

export type CreateStickerMessageParams = {
    conversationId: number;
    user: User;
    sticker: string;
};

export type CreateGroupStickerMessageParams = {
    groupId: number;
    author: User;
    sticker: string;
};

export type CreateReplyMessageParams = {
    conversationId: number;
    user: User;
    content: string;
    messageId: number;
};

export type CreateReplyGroupMessageParams = {
    groupId: number;
    user: User;
    content: string;
    messageId: number;
};

export type ChangeEmojiIconParams = {
    id: number;
    emoji: string;
};

export type ChangeGroupEmojiIconParams = {
    groupId: number;
    emoji: string;
    userId: number;
};

export type AttachmentType = 'image' | 'file';

export type getConversationMessagesParams = {
    conversationId: number;
    offset: number;
    limit: number;
};

export type getGroupMessagesWithLimitParams = {
    id: number;
    author: User;
    offset: number;
    limit: number;
};

export type SearchMessagesByContentParams = {
    conversationId: number;
    content: string;
};

export type ChangeConversationNicknameParams = {
    email: string;
    conversationId: number;
    nickname: string;
};

export type ChangeGroupNicknameParams = {
    email: string;
    groupId: number;
    nickname: string;
    authorId: number;
};
