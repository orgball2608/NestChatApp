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
};
