import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFriendRequestDto {
    @IsString()
    @IsNotEmpty()
    email: string;
}
