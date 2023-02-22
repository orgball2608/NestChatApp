import { IsNotEmpty, IsString } from 'class-validator';

export class ChangeEmojiIconDto {
    @IsString()
    @IsNotEmpty()
    emoji: string;
}
