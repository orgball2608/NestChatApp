import { Inject, Injectable } from '@nestjs/common';
import { Services } from '../../utils/constants';
import { IStorage } from '../storage';
import { S3 } from 'aws-sdk';
import { CopyAttachmentParams, uploadAttachmentParams, UploadImageParams } from '../../utils/types';
import * as process from 'process';
import { Attachment } from 'src/utils/typeorm';
import { compressImage } from 'src/utils/helpers';

@Injectable()
export class StorageService implements IStorage {
    constructor(
        @Inject(Services.SPACES_CLIENT)
        private readonly spacesClient: S3,
    ) {}

    async uploadFile(params: UploadImageParams) {
        const { key } = params;
        const uploadParams = {
            Bucket: process.env.AWS_PUBLIC_BUCKET_KEY,
            Key: key,
            Body: params.file.buffer,
            ACL: 'public-read',
            ContentType: 'image/jpeg',
        };
        await this.spacesClient.putObject(uploadParams).promise();
        const url =
            this.spacesClient.endpoint.protocol +
            '//' +
            process.env.AWS_PUBLIC_BUCKET_KEY +
            '.' +
            this.spacesClient.endpoint.hostname +
            '/' +
            key;
        return url;
    }
    deleteFile(key: string) {
        return this.spacesClient
            .deleteObject({
                Bucket: process.env.AWS_PUBLIC_BUCKET_KEY,
                Key: String(key),
            })
            .promise();
    }

    async uploadAttachment(params: uploadAttachmentParams): Promise<Attachment> {
        const { attachment, file } = params;
        const uploadOriginalParams = {
            Bucket: process.env.AWS_PUBLIC_BUCKET_KEY,
            Key: `orginal/${attachment.key}`,
            Body: file.buffer,
            ACL: 'public-read',
            ContentType: file.mimetype,
        };
        const uploadPreviewParams = {
            Bucket: process.env.AWS_PUBLIC_BUCKET_KEY,
            Key: `preview/${attachment.key}`,
            Body: await compressImage(file),
            ACL: 'public-read',
            ContentType: file.mimetype,
        };
        await this.spacesClient.putObject(uploadOriginalParams).promise();
        await this.spacesClient.putObject(uploadPreviewParams).promise();
        return attachment;
    }

    async uploadFileAttachment(params: uploadAttachmentParams): Promise<Attachment> {
        const { attachment, file } = params;
        const uploadOriginalParams = {
            Bucket: process.env.AWS_PUBLIC_BUCKET_KEY,
            Key: attachment.key,
            Body: file.buffer,
            ACL: 'public-read',
            ContentType: file.mimetype,
        };
        await this.spacesClient.putObject(uploadOriginalParams).promise();
        return attachment;
    }

    async copyAttachment(params: CopyAttachmentParams): Promise<Attachment> {
        const { attachment, key, newAttachment } = params;
        const uploadOriginalParams = {
            Bucket: process.env.AWS_PUBLIC_BUCKET_KEY,
            CopySource: `${process.env.AWS_PUBLIC_BUCKET_KEY}/orginal/${attachment.key}`,
            Key: `orginal/${key}`,
            ACL: 'public-read',
        };
        const uploadPreviewParams = {
            Bucket: process.env.AWS_PUBLIC_BUCKET_KEY,
            CopySource: `${process.env.AWS_PUBLIC_BUCKET_KEY}/preview/${attachment.key}`,
            Key: `preview/${key}`,
            ACL: 'public-read',
        };
        await this.spacesClient.copyObject(uploadOriginalParams).promise();
        await this.spacesClient.copyObject(uploadPreviewParams).promise();
        return newAttachment;
    }

    async copyFileAttachment(params: CopyAttachmentParams): Promise<Attachment> {
        const { attachment, key, newAttachment } = params;
        const uploadParams = {
            Bucket: process.env.AWS_PUBLIC_BUCKET_KEY,
            CopySource: `${process.env.AWS_PUBLIC_BUCKET_KEY}/${attachment.key}`,
            Key: `${key}`,
            ACL: 'public-read',
        };
        await this.spacesClient.copyObject(uploadParams).promise();
        return newAttachment;
    }
}
