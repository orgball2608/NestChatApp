import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'profiles' })
export class Profile {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    bio?: string;

    @Column({ nullable: true })
    location?: string;

    @Column({ nullable: true })
    avatar?: string;

    @Column({ nullable: true })
    banner?: string;
}
