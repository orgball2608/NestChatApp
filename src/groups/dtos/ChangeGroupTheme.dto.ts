import { IsNotEmpty, IsString } from 'class-validator';

export class ChangeGroupThemeDto {
    @IsNotEmpty()
    @IsString()
    theme: string;
}
