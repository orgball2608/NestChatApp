import { User } from '../../utils/typeorm';
import { IsNotEmpty } from 'class-validator';

export class VideoCallHangUpDto {
    @IsNotEmpty()
    receiver: User;
    @IsNotEmpty()
    caller: User;
}
