import { AttachmentType } from '../../utils/types';

export class CreateMessageDto {
    content: string;
    type?: AttachmentType;
}
