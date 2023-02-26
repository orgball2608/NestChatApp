import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { isAuthorized } from 'src/utils/helpers';
import { UsersModule } from '../users/users.module';
import { Services } from '../utils/constants';
import { Conversation, ConversationNickname } from '../utils/typeorm';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { ConversationMiddleware } from './middlewares/conversation.middleware';

@Module({
    imports: [TypeOrmModule.forFeature([Conversation, ConversationNickname]), UsersModule],
    controllers: [ConversationsController],
    providers: [
        {
            provide: Services.CONVERSATIONS,
            useClass: ConversationsService,
        },
    ],
    exports: [
        {
            provide: Services.CONVERSATIONS,
            useClass: ConversationsService,
        },
    ],
})
export class ConversationsModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(isAuthorized, ConversationMiddleware).forRoutes('conversations/:id');
    }
}
