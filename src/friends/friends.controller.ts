import { Controller, Inject } from '@nestjs/common';
import { Routes, Services } from 'src/utils/constants';
import { FriendsService } from './friends.service';

@Controller(Routes.FRIENDS)
export class FriendsController {
    constructor(@Inject(Services.FRIENDS) private readonly friendsService: FriendsService) {}
}
