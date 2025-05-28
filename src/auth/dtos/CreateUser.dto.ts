import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @MaxLength(20)
    firstName: string;

    @IsNotEmpty()
    @MaxLength(20)
    lastName: string;

    @IsNotEmpty()
    @MaxLength(20)
    password: string;
}
