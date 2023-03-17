import { Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { Conversation } from './Conversation';

import { BaseMessage } from './BaseMessage';
import { Attachment } from './Attachment';
import { ReactMessage } from './ReactMessage';
import { MessageStatus } from './MessageStatus';

@Entity({ name: 'messages' })
export class Message extends BaseMessage {
    @ManyToOne(() => Conversation, (conversation) => conversation.messages)
    conversation: Conversation;

    @OneToMany(() => Attachment, (attachment) => attachment.message)
    @JoinColumn()
    attachments: Attachment[];

    @OneToOne(() => Message, { createForeignKeyConstraints: false, nullable: true })
    @JoinColumn()
    reply: Message;

    @OneToMany(() => ReactMessage, (react) => react.message)
    @JoinColumn()
    reacts: ReactMessage[];

    @OneToMany(() => MessageStatus, (messageStatus) => messageStatus.message)
    messageStatuses?: MessageStatus[];
}
