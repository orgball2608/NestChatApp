import { Attachment } from 'src/utils/typeorm';
import { CopyAttachmentParams, uploadAttachmentParams, UploadImageParams } from '../utils/types';

export interface IStorage {
    uploadFile(params: UploadImageParams);
    deleteFile(key: string);
    uploadAttachment(params: uploadAttachmentParams): Promise<Attachment>;
    uploadFileAttachment(params: uploadAttachmentParams): Promise<Attachment>;
    copyAttachment(params: CopyAttachmentParams): Promise<Attachment>;
    copyFileAttachment(params: CopyAttachmentParams): Promise<Attachment>;
}
