import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Conversation } from './Conversation';
import { User } from './User';

@Entity({ name: 'conversation_nicknames' })
export class ConversationNickname {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.nicknames)
    @JoinColumn()
    user: User;

    @ManyToOne(() => Conversation, (conversation) => conversation.nicknames)
    @JoinColumn()
    conversation: Conversation;

    @Column()
    nickname: string;
}
