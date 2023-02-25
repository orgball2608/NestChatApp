import { IsNotEmpty, IsString } from 'class-validator';

export class SearchMessageByContentDto {
    @IsString()
    @IsNotEmpty()
    content: string;
}
