import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GroupMessage } from './GroupMessage';

@Entity({ name: 'group_attachments' })
export class GroupAttachment {
    @PrimaryGeneratedColumn('uuid')
    key: string;

    @ManyToOne(() => GroupMessage, (message) => message.attachments, {
        onDelete: 'CASCADE',
    })
    message: GroupMessage;

    @Column({ nullable: true, default: 'image' })
    type: string;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    size: number;
}
