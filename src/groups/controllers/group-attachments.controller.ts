import { Controller, Get, Inject, Param, ParseIntPipe } from '@nestjs/common';
import { Routes, Services } from '../../utils/constants';
import { AuthUser } from '../../utils/decorator';
import { User } from '../../utils/typeorm';

@Controller(Routes.GROUP_ATTACHMENTS)
export class GroupAttachmentsController {
    constructor(@Inject(Services.GROUP_ATTACHMENTS) private readonly groupAttachmentService) {}

    @Get()
    async getGroupAttachments(@AuthUser() user: User, @Param('id', ParseIntPipe) id: number) {
        return await this.groupAttachmentService.getGroupAttachments({
            author: user,
            id,
        });
    }
}
