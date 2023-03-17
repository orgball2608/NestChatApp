import { Exclude } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ConversationNickname } from './ConversationNickname';
import { Group } from './Group';
import { Message } from './Message';
import { Profile } from './Profile';
import { GroupMessageStatus } from './GroupMessageStatus';
import { MessageStatus } from './MessageStatus';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ select: false })
    @Exclude()
    password: string;

    @OneToMany(() => Message, (message) => message.author)
    @JoinColumn()
    messages: Message[];

    @ManyToMany(() => Group, (group) => group.users)
    groups: Group[];

    @OneToOne(() => Profile, { cascade: ['insert', 'update'] })
    @JoinColumn()
    profile: Profile;

    @OneToMany(() => ConversationNickname, (conversationNickname) => conversationNickname.user)
    nicknames: ConversationNickname[];

    @OneToMany(() => GroupMessageStatus, (groupMessageStatus) => groupMessageStatus.user)
    groupMessageStatuses?: GroupMessageStatus;

    @OneToMany(() => MessageStatus, (mssageStatus) => mssageStatus.user)
    messageStatuses?: MessageStatus;
}
