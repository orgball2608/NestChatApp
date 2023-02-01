import { UploadImageParams } from '../utils/types';

export interface IStorage {
    uploadFile(params: UploadImageParams);
    deleteFile(key: string);
}
