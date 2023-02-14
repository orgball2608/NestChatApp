import { IsNotEmpty, IsString } from 'class-validator';
import { ReactionType } from 'src/utils/types';

export class CreateReactDto {
    @IsNotEmpty()
    @IsString()
    type: ReactionType;
}
