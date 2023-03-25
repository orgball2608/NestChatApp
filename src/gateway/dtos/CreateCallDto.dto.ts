import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCallDtoDto {
    @IsNumber()
    @IsNotEmpty()
    recipientId: number;
    @IsNumber()
    @IsNotEmpty()
    conversationId: number;
}
