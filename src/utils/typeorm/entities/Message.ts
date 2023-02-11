import { Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Conversation } from './Conversation';

import { BaseMessage } from './BaseMessage';
import { Attachment } from './Attachment';

@Entity({ name: 'messages' })
export class Message extends BaseMessage {
    @ManyToOne(() => Conversation, (conversation) => conversation.messages)
    conversation: Conversation;

    @OneToMany(() => Attachment, (attachment) => attachment.message)
    @JoinColumn()
    attachments: Attachment[];
}
