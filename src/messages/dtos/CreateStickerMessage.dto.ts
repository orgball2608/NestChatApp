import { IsNotEmpty, IsString } from 'class-validator';

export class CreateStickerMessageDto {
    @IsString()
    @IsNotEmpty()
    sticker: string;
}
