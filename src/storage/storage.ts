import { Attachment } from 'src/utils/typeorm';
import { uploadAttachmentParams, UploadImageParams } from '../utils/types';

export interface IStorage {
    uploadFile(params: UploadImageParams);
    deleteFile(key: string);
    uploadAttachment(params: uploadAttachmentParams): Promise<Attachment>;
    uploadFileAttachment(params: uploadAttachmentParams): Promise<Attachment>;
}
