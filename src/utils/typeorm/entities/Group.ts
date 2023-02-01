import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { GroupMessage } from './GroupMessage';

@Entity({ name: 'groups' })
export class Group {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    title?: string;

    @ManyToMany(() => User, (user) => user.groups)
    @JoinTable()
    users: User[];

    @OneToOne(() => User, { createForeignKeyConstraints: false })
    @JoinColumn()
    creator: User;

    @OneToOne(() => User, { createForeignKeyConstraints: false })
    @JoinColumn()
    owner: User;

    @OneToMany(() => GroupMessage, (message) => message.group, {
        cascade: ['insert', 'remove', 'update'],
    })
    @JoinColumn()
    messages: GroupMessage[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: number;

    @OneToOne(() => GroupMessage)
    @JoinColumn({ name: 'last_message_sent' })
    lastMessageSent: GroupMessage;

    @UpdateDateColumn({ name: 'updated_at' })
    lastMessageSentAt: Date;
}
