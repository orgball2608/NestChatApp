import {
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { Routes, Services } from '../../utils/constants';
import { AuthUser } from '../../utils/decorator';
import { User } from '../../utils/typeorm';
import { CreateGroupMessageDto } from '../dtos/CreateGroupMessage.dto';
import { AttachmentFile, getGroupMessagesResponse } from '../../utils/types';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EditGroupMessageDto } from '../dtos/EditGroupMessage.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { EmptyMessageException } from 'src/messages/exceptions/EmptyMessage';
import { CreateGroupGifMessageDto } from '../dtos/CreateGroupGifMessage.dto';
import { CreateGroupStickerMessageDto } from '../dtos/CreateGroupStickerMessage.dto';
import { CreateReplyGroupMessageDto } from '../dtos/CreateReplyGroupMessage';

@Controller(Routes.GROUP_MESSAGES)
export class GroupMessagesController {
    constructor(
        @Inject(Services.GROUP_MESSAGES) private readonly groupMessageService,
        private readonly eventEmitter: EventEmitter2,
    ) {}
    @Post()
    @UseInterceptors(
        FileFieldsInterceptor([
            {
                name: 'attachments',
                maxCount: 5,
            },
        ]),
    )
    async createGroupMessage(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) groupId: number,
        @UploadedFiles() { attachments }: { attachments: AttachmentFile[] },
        @Body() { content, type }: CreateGroupMessageDto,
    ) {
        if ((!attachments && !content) || (attachments && !type)) throw new EmptyMessageException();
        const response = await this.groupMessageService.createGroupMessage({
            author: user,
            groupId,
            content,
            attachments,
            type,
        });
        this.eventEmitter.emit('group.message.create', response);
        return;
    }

    //forward group message to conversation by forwardId
    @Post(':messageId/forward/conversation/:forwardId')
    async createConversationForWardMessage(
        @AuthUser() user: User,
        @Param('forwardId', ParseIntPipe)
        forwardId: number,
        @Param('messageId', ParseIntPipe)
        messageId: number,
    ) {
        const params = { id: forwardId, messageId, author: user };
        const response = await this.groupMessageService.forwardConversationMessage(params);
        this.eventEmitter.emit('message.create', response);
        return response;
    }

    //forward group message to group by forwardId
    @Post(':messageId/forward/group/:forwardId')
    async createGroupForWardMessage(
        @AuthUser() user: User,
        @Param('forwardId', ParseIntPipe)
        forwardId: number,
        @Param('messageId', ParseIntPipe)
        messageId: number,
    ) {
        const params = { id: forwardId, messageId, author: user };
        const response = await this.groupMessageService.forwardGroupMessage(params);
        this.eventEmitter.emit('group.message.create', response);
        return response;
    }

    @Get()
    async getGroupMessages(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<getGroupMessagesResponse> {
        const messages = await this.groupMessageService.getGroupMessages({ id, author: user });
        return { id, messages };
    }

    @Get('limit/:limit/offset/:offset')
    async getGroupMessagesWithLimit(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) id: number,
        @Param('limit', ParseIntPipe) limit: number,
        @Param('offset', ParseIntPipe) offset: number,
    ): Promise<getGroupMessagesResponse> {
        const messages = await this.groupMessageService.getGroupMessagesWithLimit({
            id,
            author: user,
            limit,
            offset,
        });
        return { id, messages };
    }

    @Delete(':messageId')
    async deleteGroupMessage(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) groupId: number,
        @Param('messageId', ParseIntPipe) messageId: number,
    ) {
        const messages = await this.groupMessageService.deleteGroupMessage({
            userId: user.id,
            groupId,
            messageId,
        });
        this.eventEmitter.emit('group.message.delete', {
            userId: user.id,
            messageId,
            groupId,
            messages,
        });
        return { groupId, messageId, messages };
    }

    @Patch(':messageId')
    async editGroupMessage(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) groupId: number,
        @Param('messageId', ParseIntPipe) messageId: number,
        @Body() { content }: EditGroupMessageDto,
    ) {
        const editedMessage = await this.groupMessageService.editGroupMessage({
            userId: user.id,
            groupId,
            messageId,
            content,
        });

        this.eventEmitter.emit('group.message.update', editedMessage);
        return editedMessage;
    }

    @Post('gif')
    async createGroupGifMessage(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) groupId: number,
        @Body() { gif }: CreateGroupGifMessageDto,
    ) {
        if (!gif) throw new EmptyMessageException();
        const response = await this.groupMessageService.createGroupGifMessage({
            author: user,
            groupId,
            gif,
        });
        this.eventEmitter.emit('group.message.create', response);
        return;
    }

    @Post('sticker')
    async createGroupStickerMessage(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) groupId: number,
        @Body() { sticker }: CreateGroupStickerMessageDto,
    ) {
        if (!sticker) throw new EmptyMessageException();
        const response = await this.groupMessageService.createGroupStickerMessage({
            author: user,
            groupId,
            sticker,
        });
        this.eventEmitter.emit('group.message.create', response);
        return;
    }

    @Post(':messageId/reply')
    async createReplyGroupMessage(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) groupId: number,
        @Param('messageId', ParseIntPipe) messageId: number,
        @Body() { content }: CreateReplyGroupMessageDto,
    ) {
        if (!content) throw new EmptyMessageException();
        const response = await this.groupMessageService.createReplyGroupMessage({
            user,
            groupId,
            messageId,
            content,
        });
        this.eventEmitter.emit('group.message.create', response);
        return;
    }

    @Get('length')
    getGroupMessagesLength(@Param('id', ParseIntPipe) id: number): Promise<{ length: number }> {
        return this.groupMessageService.getGroupMessagesLength(id);
    }
}
