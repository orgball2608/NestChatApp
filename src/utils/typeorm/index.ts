import { User } from './entities/User';
import { Session } from './entities/Session';
import { Conversation } from './entities/Conversation';
import { Message } from './entities/Message';
import { Group } from './entities/Group';
import { GroupMessage } from './entities/GroupMessage';

const entities = [User, Session, Conversation, Message, Group, GroupMessage];

export default entities;

export { User, Session, Conversation, Message, Group, GroupMessage };
