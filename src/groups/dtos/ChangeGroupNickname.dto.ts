import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ChangeGroupNicknameDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    nickname: string;
}
