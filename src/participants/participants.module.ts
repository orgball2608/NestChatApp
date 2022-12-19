import { Module } from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { ParticipantsService } from './participants.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Participant} from "../utils/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([Participant])],
  providers: [{
    provide: Services.PARTICIPANTS,
    useClass: ParticipantsService,
  }],
  exports: [
    {
      provide: Services.PARTICIPANTS,
      useClass: ParticipantsService,
    },
  ],
})
export class ParticipantsModule {}
