import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateGroupCallDtoDto {
    @IsNumber()
    @IsNotEmpty()
    groupId: number;
}
