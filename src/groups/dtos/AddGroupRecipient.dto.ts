import { IsNotEmpty, IsString } from 'class-validator';

export class AddGroupRecipientDto {
    @IsString()
    @IsNotEmpty()
    email: string;
}
