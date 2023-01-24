import { Module } from '@nestjs/common';
import { GroupMessagesController } from './group-messages.controller';
import { GroupMessagesService } from './group-messages.service';
import { Services } from '../utils/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupMessage } from '../utils/typeorm';
import { GroupsModule } from '../groups/groups.module';

@Module({
    imports: [TypeOrmModule.forFeature([GroupMessage]), GroupsModule],
    controllers: [GroupMessagesController],
    providers: [
        {
            provide: Services.GROUP_MESSAGES,
            useClass: GroupMessagesService,
        },
    ],
})
export class GroupMessagesModule {}
