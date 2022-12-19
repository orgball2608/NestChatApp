import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { Services } from 'src/utils/constants';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Conversation, Participant, User} from "../utils/typeorm";
import {ParticipantsModule} from "../participants/participants.module";
import {UsersModule} from "../users/users.module";

@Module({
  imports:[TypeOrmModule.forFeature([Conversation,Participant]),
    ParticipantsModule,
    UsersModule,
  ],
  providers: [{
    provide: Services.CONVERSATIONS,
    useClass: ConversationsService,
  }],
  controllers: [ConversationsController]
})
export class ConversationsModule {}
