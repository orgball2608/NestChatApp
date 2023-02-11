import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from './Message';

@Entity({ name: 'attachments' })
export class Attachment {
    @PrimaryGeneratedColumn('uuid')
    key: string;

    @ManyToOne(() => Message, (message) => message.attachments)
    message: Message;
}
