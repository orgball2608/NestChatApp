import { AttachmentType } from '../../utils/types';
export class CreateGroupMessageDto {
    content: string;
    type?: AttachmentType;
}
