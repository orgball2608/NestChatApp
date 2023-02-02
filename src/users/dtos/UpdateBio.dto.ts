import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateBioDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    bio: string;
}
