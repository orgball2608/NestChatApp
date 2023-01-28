import { Module } from '@nestjs/common';
import { MessagingGateway } from './gateway';
import { Services } from '../utils/constants';
import { GatewaySessionManager } from './gateway.session';
import { ConversationsModule } from '../conversations/conversations.module';
import { GroupsModule } from '../groups/groups.module';

@Module({
    imports: [ConversationsModule, GroupsModule],
    providers: [
        MessagingGateway,
        {
            provide: Services.GATEWAY_SESSION_MANAGER,
            useClass: GatewaySessionManager,
        },
    ],
})
export class GatewayModule {}
