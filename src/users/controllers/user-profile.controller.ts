import { Body, Controller, Get, Inject, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorator';
import { User } from 'src/utils/typeorm';
import { UpdateBioDto } from '../dtos/UpdateBio.dto';
import { UpdateLocationDto } from '../dtos/UpdateLocation.dto';
import { IUserProfileService } from '../interfaces/user-profile';

@Controller(Routes.USER_PROFILE)
export class UserProfileController {
    constructor(@Inject(Services.USER_PROFILE) private readonly userProfileService: IUserProfileService) {}

    @Get()
    getProfile(@AuthUser() user: User) {
        return this.userProfileService.getProfile(user);
    }

    @UseInterceptors(FileInterceptor('banner'))
    @Post('update/banner')
    updateBanner(@AuthUser() user: User, @UploadedFile() file) {
        const params = { banner: file };
        return this.userProfileService.updateBanner(user, params);
    }

    @UseInterceptors(FileInterceptor('avatar'))
    @Post('update/avatar')
    updateAvatar(@AuthUser() user: User, @UploadedFile() file) {
        const params = { avatar: file };
        return this.userProfileService.updateAvatar(user, params);
    }

    @Post('update/bio')
    updateBio(@AuthUser() user: User, @Body() { bio }: UpdateBioDto) {
        const params = { bio };
        return this.userProfileService.updateBio(user, params);
    }

    @Post('update/location')
    updateLocation(@AuthUser() user: User, @Body() { location }: UpdateLocationDto) {
        const params = { location };
        return this.userProfileService.updateLocation(user, params);
    }
}
