import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from './Message';

@Entity({ name: 'attachments' })
export class Attachment {
    @PrimaryGeneratedColumn('uuid')
    key: string;

    @ManyToOne(() => Message, (message) => message.attachments, {
        onDelete: 'CASCADE',
    })
    message: Message;

    @Column({ nullable: true, default: 'image' })
    type: string;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    size: number;
}
