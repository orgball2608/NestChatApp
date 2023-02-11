import { ArrayNotEmpty, IsString } from 'class-validator';

export class AddGroupRecipientDto {
    @ArrayNotEmpty()
    @IsString({ each: true })
    emails: string[];
}
