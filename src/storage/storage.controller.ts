import { Controller, Inject, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Services } from '../utils/constants';
import { FileInterceptor } from '@nestjs/platform-express';
import { generateUUIDV4 } from '../utils/helpers';

@Controller('storage')
export class StorageController {
    constructor(@Inject(Services.IMAGE_UPLOAD_SERVICE) private readonly services) {}

    @UseInterceptors(FileInterceptor('file'))
    @Post('spaces')
    async uploadFile(@UploadedFile() file) {
        const key = generateUUIDV4();
        return await this.services.uploadFile({ key, file });
    }

    @Patch(':key')
    async deleteImage(@Param('key') key: string) {
        return await this.services.deleteFile(key);
    }
}
