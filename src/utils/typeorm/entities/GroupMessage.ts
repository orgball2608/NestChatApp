import { Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Attachment } from './Attachment';
import { BaseMessage } from './BaseMessage';
import { Group } from './Group';
import { GroupAttachment } from './GroupAttachments';

@Entity({ name: 'group_messages' })
export class GroupMessage extends BaseMessage {
    @ManyToOne(() => Group, (group) => group.messages)
    group?: Group;

    @OneToMany(() => GroupAttachment, (attachment) => attachment.message)
    @JoinColumn()
    attachments?: GroupAttachment[];
}
