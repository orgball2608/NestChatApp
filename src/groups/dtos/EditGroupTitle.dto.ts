import { IsNotEmpty, IsString } from 'class-validator';

export class EditGroupTitleDto {
    @IsNotEmpty()
    @IsString()
    title: string;
}
