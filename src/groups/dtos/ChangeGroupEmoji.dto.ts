import { IsNotEmpty, IsString } from 'class-validator';

export class ChangeGroupEmojiDto {
    @IsNotEmpty()
    @IsString()
    emoji: string;
}
