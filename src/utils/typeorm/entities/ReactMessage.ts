import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from './Message';
import { User } from './User';

@Entity({ name: 'reacts' })
export class ReactMessage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    type: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: number;

    @OneToOne(() => User, { createForeignKeyConstraints: false })
    @JoinColumn()
    author: User;

    @ManyToOne(() => Message, (message) => message.reacts)
    @JoinColumn()
    message: Message;
}
