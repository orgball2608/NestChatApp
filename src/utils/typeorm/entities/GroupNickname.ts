import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from './Group';
import { User } from './User';

@Entity({ name: 'group_nicknames' })
export class GroupNickname {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.nicknames)
    @JoinColumn()
    user: User;

    @ManyToOne(() => Group, (group) => group.nicknames)
    @JoinColumn()
    group: Group;

    @Column({
        nullable: true,
    })
    nickname: string;
}
