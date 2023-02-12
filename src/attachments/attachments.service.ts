import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Services } from 'src/utils/constants';
import { Attachment, GroupAttachment } from 'src/utils/typeorm';
import { AttachmentFile } from 'src/utils/types';
import { Repository } from 'typeorm';
import { IAttachmentService } from './attachments';

@Injectable()
export class AttachmentsService implements IAttachmentService {
    constructor(
        @InjectRepository(Attachment) private readonly attachRepository: Repository<Attachment>,
        @InjectRepository(GroupAttachment) private readonly groupAttachRepository: Repository<GroupAttachment>,
        @Inject(Services.IMAGE_UPLOAD_SERVICE) private readonly imageUploadService,
    ) {}

    create(attachments: AttachmentFile[]): Promise<Attachment[]> {
        const promise = attachments.map(async (a) => {
            const newAttachment = this.attachRepository.create();
            const attachment = await this.attachRepository.save(newAttachment);
            return this.imageUploadService.uploadAttachment({ attachment, file: a });
        });
        return Promise.all(promise);
    }

    createGroupAttachments(attachments: AttachmentFile[]): Promise<GroupAttachment[]> {
        const promise = attachments.map(async (a) => {
            const newAttachment = this.groupAttachRepository.create();
            const attachment = await this.groupAttachRepository.save(newAttachment);
            return this.imageUploadService.uploadAttachment({ attachment, file: a });
        });
        return Promise.all(promise);
    }
}
