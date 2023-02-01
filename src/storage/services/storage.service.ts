import { Inject, Injectable } from '@nestjs/common';
import { Services } from '../../utils/constants';
import { IStorage } from '../storage';
import { S3 } from 'aws-sdk';
import { UploadImageParams } from '../../utils/types';
import * as process from 'process';

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
    async deleteFile(key: string) {
        return await this.spacesClient
            .deleteObject({
                Bucket: process.env.AWS_PUBLIC_BUCKET_KEY,
                Key: String(key),
            })
            .promise();
    }
}
