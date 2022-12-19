import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { Services } from 'src/utils/constants';

@Module({
  providers: [{
    provide: Services.CONVERSATIONS,
    useClass: ConversationsService,
  }],
  controllers: [ConversationsController]
})
export class ConversationsModule {}
