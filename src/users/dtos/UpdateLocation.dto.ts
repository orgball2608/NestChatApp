import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateLocationDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    location: string;
}
