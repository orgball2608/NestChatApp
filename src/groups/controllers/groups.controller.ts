import {
    Body,
    Controller,
    FileTypeValidator,
    Get,
    Inject,
    MaxFileSizeValidator,
    Param,
    ParseFilePipe,
    ParseIntPipe,
    Patch,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { Routes, Services } from '../../utils/constants';
import { IGroupService } from '../interfaces/groups';
import { AuthUser } from '../../utils/decorator';
import { User } from '../../utils/typeorm';
import { CreateGroupDto } from '../dtos/CreateGroup.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EditGroupTitleDto } from '../dtos/EditGroupTitle.dto';
import { TransferOwnerDto } from '../dtos/TransferOwner.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChangeGroupEmojiDto } from '../dtos/ChangeGroupEmoji.dto';
import { ChangeGroupNicknameDto } from '../dtos/ChangeGroupNickname.dto';
import { ChangeGroupThemeDto } from '../dtos/ChangeGroupTheme.dto';

@Controller(Routes.GROUPS)
export class GroupsController {
    constructor(
        @Inject(Services.GROUPS) private readonly groupServices: IGroupService,
        private eventEmitter: EventEmitter2,
    ) {}

    @Post()
    async createGroups(@AuthUser() user: User, @Body() createGroupPayload: CreateGroupDto) {
        const group = await this.groupServices.createGroup({ ...createGroupPayload, creator: user });
        this.eventEmitter.emit('group.create', group);
        return group;
    }

    @Get()
    async getGroups(@AuthUser() user: User) {
        return this.groupServices.getGroups({ userId: user.id });
    }

    @Get(':id')
    async getGroupById(@AuthUser() user: User, @Param('id') id: number) {
        return this.groupServices.getGroupById({ id, userId: user.id });
    }

    @Post(':id')
    async editGroupTitle(
        @AuthUser() user: User,
        @Param('id') id: number,
        @Body() editGroupTitlePayload: EditGroupTitleDto,
    ) {
        const { title } = editGroupTitlePayload;
        const response = await this.groupServices.editGroupTitle({
            groupId: id,
            userId: user.id,
            title,
        });
        this.eventEmitter.emit('group.title.edit', response);
        return response;
    }

    @Patch()
    async updateOwner() {
        await this.groupServices.updateOwner();
        return 'update owner';
    }

    @Patch(':id')
    async changeOwner(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) id: number,
        @Body() { newOwnerId }: TransferOwnerDto,
    ) {
        const response = await this.groupServices.changeOwner({
            groupId: id,
            userId: user.id,
            newOwnerId,
        });
        this.eventEmitter.emit('group.owner.change', response);
        return response;
    }

    @Patch(':id/avatar')
    @UseInterceptors(FileInterceptor('avatar'))
    async updateGroupAvatar(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
                    new MaxFileSizeValidator({ maxSize: 5242880 }),
                ],
            }),
        )
        avatar,
    ) {
        const response = await this.groupServices.updateGroupAvatar({
            groupId: id,
            userId: user.id,
            avatar,
        });
        this.eventEmitter.emit('group.avatar.update', response);
        return response;
    }

    @Post(':id/emoji')
    async changeGroupEmojiIcon(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) id: number,
        @Body() { emoji }: ChangeGroupEmojiDto,
    ) {
        const group = await this.groupServices.changeGroupEmojiIcon({
            groupId: id,
            userId: user.id,
            emoji,
        });
        this.eventEmitter.emit('group.emoji.change', group);
        return group;
    }

    @Post(':id/nickname')
    async changeGroupNickname(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) id: number,
        @Body() { nickname, email }: ChangeGroupNicknameDto,
    ) {
        const group = await this.groupServices.changeGroupNickname({
            groupId: id,
            authorId: user.id,
            nickname,
            email,
        });
        this.eventEmitter.emit('group.nickname.change', group);
        return group;
    }

    @Post(':id/theme')
    async changeGroupTheme(
        @AuthUser() user: User,
        @Param('id', ParseIntPipe) id: number,
        @Body() { theme }: ChangeGroupThemeDto,
    ) {
        const group = await this.groupServices.changeGroupTheme({
            groupId: id,
            userId: user.id,
            theme,
        });
        this.eventEmitter.emit('group.theme.change', group);
        return group;
    }
}
