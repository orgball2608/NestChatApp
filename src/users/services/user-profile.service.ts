import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Services } from 'src/utils/constants';
import { generateUUIDV4 } from 'src/utils/helpers';
import { Profile } from 'src/utils/typeorm';
import { UpdateProfileParams } from 'src/utils/types';
import { Repository } from 'typeorm';
import { IUserService } from '../interfaces/user';
import { IUserProfileService } from '../interfaces/user-profile';

@Injectable()
export class UserProfileService implements IUserProfileService {
    constructor(
        @InjectRepository(Profile) private readonly profileRepository: Repository<Profile>,
        @Inject(Services.IMAGE_UPLOAD_SERVICE) private readonly imageUploadService,
        @Inject(Services.USERS) private readonly userService: IUserService,
    ) {}

    createProfile() {
        const profile = this.profileRepository.create();
        return this.profileRepository.save(profile);
    }

    async getProfile(user) {
        if (!user.profile) user.profile = await this.createProfile();
        return user.profile;
    }

    async updateBanner(user, params: UpdateProfileParams) {
        const { banner } = params;
        if (user.profile) {
            // const bannerKey = user.profile.avatar.split('/').pop();
            // await this.imageUploadService.deleteFile(bannerKey);
            const key = generateUUIDV4();
            const bannerUrl = await this.imageUploadService.uploadFile({
                file: banner,
                key,
            });
            user.profile.banner = bannerUrl;
            await this.imageUploadService.deleteFile(key);
            await this.profileRepository.save(user.profile);
            return this.userService.saveUser(user);
        }
        user.profile = await this.createProfile();
        const key = generateUUIDV4();
        const bannerUrl = await this.imageUploadService.uploadFile({
            file: banner,
            key,
        });
        user.profile.banner = bannerUrl;
        await this.profileRepository.save(user.profile);
        return this.userService.saveUser(user);
    }

    async updateAvatar(user, params: UpdateProfileParams) {
        const { avatar } = params;
        if (user.profile) {
            // const avatarKey = user.profile.avatar.split('/').pop();
            // await this.imageUploadService.deleteFile(avatarKey);
            const key = generateUUIDV4();
            const avatarUrl = await this.imageUploadService.uploadFile({
                file: avatar,
                key,
            });
            user.profile.avatar = avatarUrl;
            await this.profileRepository.save(user.profile);
            return this.userService.saveUser(user);
        }
        user.profile = await this.createProfile();
        const key = generateUUIDV4();
        const avatarUrl = await this.imageUploadService.uploadFile({
            file: avatar,
            key,
        });
        user.profile.avatar = avatarUrl;
        await this.profileRepository.save(user.profile);
        return this.userService.saveUser(user);
    }

    async updateBio(user, params: UpdateProfileParams) {
        const { bio } = params;
        if (user.profile) {
            user.profile.bio = bio;
            await this.profileRepository.save(user.profile);
            return this.userService.saveUser(user);
        }
        user.profile = await this.createProfile();
        user.profile.bio = bio;
        await this.profileRepository.save(user.profile);
        return this.userService.saveUser(user);
    }

    async updateLocation(user, params: UpdateProfileParams) {
        const { location } = params;
        if (user.profile) {
            user.profile.location = location;
            await this.profileRepository.save(user.profile);
            return this.userService.saveUser(user);
        }
        user.profile = await this.createProfile();
        user.profile.location = location;
        await this.profileRepository.save(user.profile);
        return this.userService.saveUser(user);
    }
}
