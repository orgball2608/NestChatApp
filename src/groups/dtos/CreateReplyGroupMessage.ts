import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReplyGroupMessageDto {
    @IsString()
    @IsNotEmpty()
    content: string;
}
