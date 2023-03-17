import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';
import { Message } from './Message';

@Entity({ name: 'message_statuses' })
export class MessageStatus {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    seen: boolean;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => Message, { onDelete: 'CASCADE' })
    message: Message;
}
