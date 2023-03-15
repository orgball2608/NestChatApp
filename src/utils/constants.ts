export enum Routes {
    AUTH = 'auth',
    USERS = 'users',
    CONVERSATIONS = 'conversations',
    MESSAGES = 'conversations/:id/messages',
    GROUPS = 'groups',
    GROUP_MESSAGES = 'groups/:id/messages',
    GROUP_RECIPIENTS = 'groups/:id/recipients',
    GROUP_ATTACHMENTS = 'groups/:id/attachments',
    FRIENDS = 'friends',
    FRIEND_REQUESTS = 'friend-requests',
    USER_PROFILE = 'user-profile',
    REACTS = 'conversations/:id/messages/:messageId/reacts',
    REACTS_GROUP_MESSAGE = 'groups/:id/messages/:messageId/reacts',
}

export enum Services {
    AUTH = 'AUTH_SERVICE',
    USERS = 'USERS_SERVICE',
    CONVERSATIONS = 'CONVERSATIONS_SERVICE',
    MESSAGES = 'MESSAGES_SERVICE',
    GATEWAY_SESSION_MANAGER = 'GATEWAY_SESSION_MANAGER',
    GROUPS = 'GROUPS_SERVICE',
    GROUP_MESSAGES = 'GROUP_MESSAGES_SERVICE',
    GROUP_RECIPIENTS = 'GROUP_RECIPIENTS_SERVICE',
    GROUP_ATTACHMENTS = 'GROUP_ATTACHMENTS_SERVICE',
    SPACES_CLIENT = 'SPACES_CLIENT',
    IMAGE_UPLOAD_SERVICE = 'IMAGE_UPLOAD_SERVICE',
    FRIENDS = 'FRIENDS_SERVICE',
    FRIEND_REQUESTS = 'FRIEND_REQUESTS_SERVICE',
    USER_PROFILE = 'USER_PROFILE_SERVICE',
    ATTACHMENTS = 'ATTACHMENTS_SERVICE',
    REACTS = 'REACTS_SERVICE',
}

export enum WebsocketEvents {
    FRIEND_REQUEST_CREATE = 'onFriendRequestReceived',
    FRIEND_REQUEST_ACCEPTED = 'onFriendRequestAccepted',
    FRIEND_REQUEST_REJECTED = 'onFriendRequestRejected',
    FRIEND_REQUEST_CANCELLED = 'onFriendRequestCancelled',
    FRIEND_REMOVED = 'onFriendRemoved',
}

export enum ServerEvents {
    FRIEND_REQUEST_CREATE = 'friendrequest.create',
    FRIEND_REQUEST_ACCEPTED = 'friendrequest.accepted',
    FRIEND_REQUEST_REJECTED = 'friendrequest.rejected',
    FRIEND_REQUEST_CANCELLED = 'friendrequest.cancelled',
    FRIEND_REMOVED = 'friend.removed',
}
