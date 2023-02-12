import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from 'src/storage/storage.module';
import { Services } from 'src/utils/constants';
import { Attachment, GroupAttachment } from '../utils/typeorm';
import { AttachmentsController } from './attachments.controller';
import { AttachmentsService } from './attachments.service';

@Module({
    imports: [TypeOrmModule.forFeature([Attachment, GroupAttachment]), StorageModule],
    controllers: [AttachmentsController],
    providers: [
        {
            provide: Services.ATTACHMENTS,
            useClass: AttachmentsService,
        },
    ],
    exports: [
        {
            provide: Services.ATTACHMENTS,
            useClass: AttachmentsService,
        },
    ],
})
export class AttachmentsModule {}
