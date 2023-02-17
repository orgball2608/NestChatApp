import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupStickerMessageDto {
    @IsString()
    @IsNotEmpty()
    sticker: string;
}
