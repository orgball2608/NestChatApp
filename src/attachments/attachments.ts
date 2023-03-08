import { Attachment, GroupAttachment } from 'src/utils/typeorm';
import { AttachmentFile } from 'src/utils/types';

export interface IAttachmentService {
    create(attachments: AttachmentFile[], type: string): Promise<Attachment[]>;
    createGroupAttachments(attachments: AttachmentFile[], type: string): Promise<GroupAttachment[]>;
    copyAttachments(attachments: Attachment[] | GroupAttachment[]): Promise<Attachment[]>;
    copyGroupAttachments(attachments: Attachment[] | GroupAttachment[]): Promise<GroupAttachment[]>;
}
