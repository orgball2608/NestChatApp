// index.ts
import * as AWS from 'aws-sdk';
import { Provider } from '@nestjs/common';
import { Services } from 'src/utils/constants';

const S3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

export const SpacesServiceProvider: Provider<AWS.S3> = {
    provide: Services.SPACES_CLIENT,
    useValue: S3,
};

export interface UploadedMulterFileI {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}
