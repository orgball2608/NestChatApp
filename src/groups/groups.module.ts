import { Module } from '@nestjs/common';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { Services } from '../utils/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from '../utils/typeorm';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [UsersModule, TypeOrmModule.forFeature([Group])],
    controllers: [GroupsController],
    providers: [
        {
            provide: Services.GROUPS,
            useClass: GroupsService,
        },
    ],
    exports: [
        {
            provide: Services.GROUPS,
            useClass: GroupsService,
        },
    ],
})
export class GroupsModule {}
