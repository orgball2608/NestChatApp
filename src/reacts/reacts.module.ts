import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesModule } from 'src/messages/messages.module';
import { Services } from 'src/utils/constants';
import { ReactGroupMessage, ReactMessage } from 'src/utils/typeorm';
import { ReactsService } from './reacts.service';
import { ReactsController } from './controllers/reacts.controller';
import { GroupsModule } from 'src/groups/groups.module';
import { ReactsGroupMessageController } from './controllers/reacts-group-message';

@Module({
    imports: [TypeOrmModule.forFeature([ReactMessage, ReactGroupMessage]), MessagesModule, GroupsModule],
    providers: [
        {
            provide: Services.REACTS,
            useClass: ReactsService,
        },
    ],
    exports: [
        {
            provide: Services.REACTS,
            useClass: ReactsService,
        },
    ],
    controllers: [ReactsController, ReactsGroupMessageController],
})
export class ReactsModule {}
