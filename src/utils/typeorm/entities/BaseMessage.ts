import { Column, CreateDateColumn, DeleteDateColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';

export abstract class BaseMessage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text', { nullable: true })
    content: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: number;

    @ManyToOne(() => User, (user) => user.messages)
    author: User;

    @Column('text', { nullable: true })
    gif: string;

    @Column('text', { nullable: true })
    sticker: string;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: number;
}
