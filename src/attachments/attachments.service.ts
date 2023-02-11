import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Services } from 'src/utils/constants';
import { Attachment } from 'src/utils/typeorm';
import { AttachmentFile } from 'src/utils/types';
import { Repository } from 'typeorm';
import { IAttachmentService } from './attachments';

@Injectable()
export class AttachmentsService implements IAttachmentService {
    constructor(
        @InjectRepository(Attachment) private readonly attachRepository: Repository<Attachment>,
        @Inject(Services.IMAGE_UPLOAD_SERVICE) private readonly imageUploadService,
    ) {}

    create(attachments: AttachmentFile[]): Promise<Attachment[]> {
        const promise = attachments.map((a) => {
            const newAttachment = this.attachRepository.create();
            return this.attachRepository.save(newAttachment).then((attachment) => {
                return this.imageUploadService.uploadAttachment({ attachment, file: a });
            });
        });
        return Promise.all(promise);
    }
}
