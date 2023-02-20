import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReplyMessageDto {
    @IsString()
    @IsNotEmpty()
    content: string;
}
