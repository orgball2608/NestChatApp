import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesModule } from 'src/messages/messages.module';
import { Services } from 'src/utils/constants';
import { ReactMessage } from 'src/utils/typeorm';
import { ReactsService } from './reacts.service';
import { ReactsController } from './reacts.controller';

@Module({
    imports: [TypeOrmModule.forFeature([ReactMessage]), MessagesModule],
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
    controllers: [ReactsController],
})
export class ReactsModule {}
