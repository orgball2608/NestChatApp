import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupGifMessageDto {
    @IsString()
    @IsNotEmpty()
    gif: string;
}
