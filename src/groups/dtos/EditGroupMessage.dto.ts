import { IsNotEmpty, IsString } from 'class-validator';

export class EditGroupMessageDto {
    @IsNotEmpty()
    @IsString()
    content: string;
}
