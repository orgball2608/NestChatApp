import { Module } from '@nestjs/common';
import { MessagingGateway } from './gateway';
import { Services } from '../utils/constants';
import { GatewaySessionManager } from './gateway.session';

@Module({
    providers: [
        MessagingGateway,
        {
            provide: Services.GATEWAY_SESSION_MANAGER,
            useClass: GatewaySessionManager,
        },
    ],
})
export class GatewayModule {}
