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
import { Routes, Services } from '../utils/constants';
import { IMessageService } from './messages';
import { AuthUser } from '../utils/decorator';
import { User } from '../utils/typeorm';
import { CreateMessageDto } from './dtos/CreateMessage.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EditMessageDto } from './dtos/EditMessage.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AttachmentFile } from 'src/utils/types';
import { EmptyMessageException } from './exceptions/EmptyMessage';
import { CreateGifMessageDto } from './dtos/CreateGifMessage.dto';
import { CreateStickerMessageDto } from './dtos/CreateStickerMessage.dto';
import { CreateReplyMessageDto } from './dtos/ReplyMessage.dto';
import { SearchMessageByContentDto } from './dtos/searchMessageByContent.dto';

@Controller(Routes.MESSAGES)
export class MessagesController {
    constructor(
        @Inject(Services.MESSAGES) private readonly messageService: IMessageService,
        private eventEmitter: EventEmitter2,
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
    async createMessage(
        @AuthUser() user: User,
        @UploadedFiles() { attachments }: { attachments: AttachmentFile[] },
        @Param('id', ParseIntPipe)
        conversationId: number,
        @Body() { content, type }: CreateMessageDto,
    ) {
        if ((!attachments && !content) || (attachments && !type)) throw new EmptyMessageException();
        const params = { user, conversationId, content, attachments, type };
        const response = await this.messageService.createMessage(params);
        this.eventEmitter.emit('message.create', response);
        return response;
    }

    @Post('gif')
    async createMessageWithGif(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe)
        conversationId: number,
        @Body() { gif }: CreateGifMessageDto,
    ) {
        if (!gif) throw new EmptyMessageException();
        const params = { user, conversationId, gif };
        const response = await this.messageService.createGifMessage(params);
        this.eventEmitter.emit('message.create', response);
        return response;
    }

    @Post('sticker')
    async createMessageWithSticker(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe)
        conversationId: number,
        @Body() { sticker }: CreateStickerMessageDto,
    ) {
        if (!sticker) throw new EmptyMessageException();
        const params = { user, conversationId, sticker };
        const response = await this.messageService.createStickerMessage(params);
        this.eventEmitter.emit('message.create', response);
        return response;
    }

    @Post(':messageId/reply')
    async createReplyMessage(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe)
        conversationId: number,
        @Param('messageId', ParseIntPipe)
        messageId: number,
        @Body() { content }: CreateReplyMessageDto,
    ) {
        if (!content) throw new EmptyMessageException();
        const params = { user, conversationId, messageId, content };
        const response = await this.messageService.createReplyMessage(params);
        this.eventEmitter.emit('message.create', response);
        return response;
    }

    @Get()
    async getMessagesFromConversation(@Param('id', ParseIntPipe) id: number) {
        const messages = await this.messageService.getMessagesByConversationId(id);
        return { id: id, messages };
    }

    @Get('limit/:limit/offset/:offset')
    async getMessagesWithLimit(
        @Param('id', ParseIntPipe) id: number,
        @Param('limit', ParseIntPipe) limit: number,
        @Param('offset', ParseIntPipe) offset: number,
    ) {
        const messages = await this.messageService.getMessagesWithLimit({
            conversationId: id,
            limit,
            offset,
        });
        return { id: id, messages };
    }

    @Delete(':messageId')
    async deleteMessageFromConversation(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) conversationId: number,
        @Param('messageId', ParseIntPipe) messageId: number,
    ) {
        await this.messageService.deleteMessage({
            userId: user.id,
            conversationId,
            messageId,
        });

        this.eventEmitter.emit('message.delete', {
            userId: user.id,
            messageId,
            conversationId,
        });

        return { conversationId, messageId };
    }

    @Patch(':messageId')
    async editMessage(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) conversationId: number,
        @Param('messageId', ParseIntPipe) messageId: number,
        @Body() { content }: EditMessageDto,
    ) {
        const params = { userId: user.id, content, conversationId, messageId };
        const messageResponse = await this.messageService.editMessage(params);
        this.eventEmitter.emit('message.edit', messageResponse);
        return messageResponse;
    }

    @Get('length')
    getMessageLength(@Param('id', ParseIntPipe) id: number) {
        return this.messageService.getMessagesLengthByConversationId(id);
    }

    @Post('search')
    searchMessageByContent(@Param('id', ParseIntPipe) id: number, @Body() { content }: SearchMessageByContentDto) {
        return this.messageService.searchMessagesByContent({
            conversationId: id,
            content,
        });
    }
}
