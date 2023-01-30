import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { Routes, Services } from '../../utils/constants';
import { IGroupService } from '../interfaces/groups';
import { AuthUser } from '../../utils/decorator';
import { User } from '../../utils/typeorm';
import { CreateGroupDto } from '../dtos/CreateGroup.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EditGroupTitleDto } from '../dtos/EditGroupTitle.dto';

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
}
