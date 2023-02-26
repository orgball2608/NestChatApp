import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ConversationNickname } from './ConversationNickname';
import { Message } from './Message';
import { User } from './User';

@Entity({ name: 'conversations' })
@Index(['creator.id', 'recipient.id'], { unique: true })
export class Conversation {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, { createForeignKeyConstraints: false })
    @JoinColumn()
    creator: User;

    @OneToOne(() => User, { createForeignKeyConstraints: false })
    @JoinColumn()
    recipient: User;

    @OneToMany(() => Message, (message) => message.conversation, {
        cascade: ['insert', 'remove', 'update'],
    })
    @JoinColumn()
    messages: Message[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: number;

    @OneToOne(() => Message)
    @JoinColumn({ name: 'last_message_sent' })
    lastMessageSent: Message;

    @UpdateDateColumn({ name: 'updated_at' })
    lastMessageSentAt: Date;

    @Column({ nullable: true, default: '👍🏽' })
    emoji?: string;

    @OneToMany(() => ConversationNickname, (conversationNickname) => conversationNickname.conversation)
    @JoinColumn()
    nicknames: ConversationNickname[];
}
