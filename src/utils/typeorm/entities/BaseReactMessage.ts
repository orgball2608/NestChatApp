import { Column, CreateDateColumn, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';

export abstract class BaseReactMessage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    type: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: number;

    @OneToOne(() => User, { createForeignKeyConstraints: false })
    @JoinColumn()
    author: User;
}
