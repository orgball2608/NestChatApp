import { FriendStatus } from 'src/utils/types';
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';

@Entity({ name: 'friend_requests' })
export class FriendRequest {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, { createForeignKeyConstraints: false })
    @JoinColumn()
    sender: User;

    @OneToOne(() => User, { createForeignKeyConstraints: false })
    @JoinColumn()
    receiver: User;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: number;

    @Column()
    status: FriendStatus;
}
