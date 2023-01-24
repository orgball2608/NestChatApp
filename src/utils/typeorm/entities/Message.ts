import { Entity, ManyToOne } from 'typeorm';
import { Conversation } from './Conversation';

import { BaseMessage } from './BaseMessage';

@Entity({ name: 'messages' })
export class Message extends BaseMessage {
    @ManyToOne(() => Conversation, (conversation) => conversation.messages)
    conversation: Conversation;
}
