import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ChangeNicknameDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    nickname: string;
}
