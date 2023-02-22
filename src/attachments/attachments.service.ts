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

    create(attachments: AttachmentFile[], type: string): Promise<Attachment[]> {
        if (type === 'image') {
            const promise = attachments.map(async (a) => {
                const newAttachment = this.attachRepository.create();
                newAttachment.type = 'image';
                const attachment = await this.attachRepository.save(newAttachment);
                return this.imageUploadService.uploadAttachment({ attachment, file: a });
            });
            return Promise.all(promise);
        } else {
            const promise = attachments.map(async (a) => {
                const newAttachment = this.attachRepository.create();
                newAttachment.type = 'file';
                const attachment = await this.attachRepository.save(newAttachment);
                return this.imageUploadService.uploadFileAttachment({ attachment, file: a });
            });
            return Promise.all(promise);
        }
    }

    createGroupAttachments(attachments: AttachmentFile[], type: string): Promise<GroupAttachment[]> {
        if (type === 'image') {
            const promise = attachments.map(async (a) => {
                const newAttachment = this.groupAttachRepository.create();
                newAttachment.type = 'image';
                const attachment = await this.groupAttachRepository.save(newAttachment);
                return this.imageUploadService.uploadAttachment({ attachment, file: a });
            });
            return Promise.all(promise);
        } else {
            const promise = attachments.map(async (a) => {
                const newAttachment = this.groupAttachRepository.create();
                newAttachment.type = 'file';
                const attachment = await this.groupAttachRepository.save(newAttachment);
                return this.imageUploadService.uploadFileAttachment({ attachment, file: a });
            });
            return Promise.all(promise);
        }
    }
}
