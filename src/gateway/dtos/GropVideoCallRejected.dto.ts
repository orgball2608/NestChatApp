import { IsNotEmpty, IsNumber } from 'class-validator';
import { User } from 'src/utils/typeorm';

export class GroupVideoCallRejectedDtoDto {
    @IsNotEmpty()
    caller: User;

    @IsNumber()
    @IsNotEmpty()
    groupId: number;
}
