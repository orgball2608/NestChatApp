import { Module } from '@nestjs/common';
import { MessagingGateway } from './websoket.gateway';

@Module({
    providers: [MessagingGateway],
})
export class GatewayModule {}
