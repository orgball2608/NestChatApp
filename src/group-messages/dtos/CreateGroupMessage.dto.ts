import { IsString } from 'class-validator';

export class CreateGroupMessageDto {
    @IsString()
    content: string;
}
