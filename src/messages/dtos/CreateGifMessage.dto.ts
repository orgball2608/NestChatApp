import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGifMessageDto {
    @IsString()
    @IsNotEmpty()
    gif: string;
}
