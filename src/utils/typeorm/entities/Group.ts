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
import { GroupNickname } from './GroupNickname';

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

    @OneToOne(() => GroupMessage,{createForeignKeyConstraints: false})
    @JoinColumn({ name: 'last_message_sent', })
    lastMessageSent: GroupMessage;

    @UpdateDateColumn({ name: 'updated_at'})
    lastMessageSentAt: Date;

    @Column({ nullable: true })
    avatar?: string;

    @Column({ nullable: true, default: '👍🏽' })
    emoji?: string;

    @OneToMany(() => GroupNickname, (groupNickname) => groupNickname.group)
    @JoinColumn()
    nicknames: GroupNickname[];

    @Column({ nullable: true, default: '#0D90F3' })
    theme?: string;
}
