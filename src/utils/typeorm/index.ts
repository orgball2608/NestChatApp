import { User } from './entities/User';
import { Session } from './entities/Session';
import { Conversation } from './entities/Conversation';
import { Message } from './entities/Message';
import { Group } from './entities/Group';
import { GroupMessage } from './entities/GroupMessage';
import { Friend } from './entities/Friend';
import { FriendRequest } from './entities/FriendRequest';
import { Profile } from './entities/Profile';
import { Attachment } from './entities/Attachment';
import { GroupAttachment } from './entities/GroupAttachments';
import { ReactMessage } from './entities/ReactMessage';
import { ReactGroupMessage } from './entities/ReactGroupMessage';
import { ConversationNickname } from './entities/ConversationNickname';
import { GroupNickname } from './entities/GroupNickname';
import { MessageStatus } from './entities/MessageStatus';
import { GroupMessageStatus } from './entities/GroupMessageStatus';
import { Peer } from './entities/Peer';

const entities = [
    User,
    Session,
    Conversation,
    Message,
    Group,
    GroupMessage,
    Friend,
    FriendRequest,
    Profile,
    Attachment,
    GroupAttachment,
    ReactMessage,
    ReactGroupMessage,
    ConversationNickname,
    GroupNickname,
    MessageStatus,
    GroupMessageStatus,
    Peer,
];

export default entities;

export {
    User,
    Session,
    Conversation,
    Message,
    Group,
    GroupMessage,
    Friend,
    FriendRequest,
    Profile,
    Attachment,
    GroupAttachment,
    ReactMessage,
    ReactGroupMessage,
    ConversationNickname,
    GroupNickname,
    MessageStatus,
    GroupMessageStatus,
    Peer,
};
