import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';
import { GroupMessage } from './GroupMessage';

@Entity({ name: 'group_message_statuses' })
export class GroupMessageStatus {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    seen: boolean;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => GroupMessage, { onDelete: 'CASCADE' })
    message: GroupMessage;
}
