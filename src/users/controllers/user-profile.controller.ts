import { Controller, Inject } from '@nestjs/common';
import { Routes, Services } from 'src/utils/constants';
import { IUserProfileService } from '../interfaces/user-profile';

@Controller(Routes.USER_PROFILE)
export class UserProfileController {
    constructor(@Inject(Services.USER_PROFILE) private readonly userProfileService: IUserProfileService) {}
}
