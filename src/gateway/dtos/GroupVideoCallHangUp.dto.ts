import { IsNotEmpty, IsString } from 'class-validator';
import { User } from '../../utils/typeorm';

export class GroupVideoCallHangUpDto {
    @IsNotEmpty()
    participants: User[];

    @IsString()
    @IsNotEmpty()
    streamId: number;
}
