import { User } from 'src/utils/typeorm';
import { UpdateProfileParams } from 'src/utils/types';

export interface IUserProfileService {
    getProfile(user: User);
    getProfileById(id: number);
    createProfile();
    updateBanner(user: User, params: UpdateProfileParams);
    updateBio(user: User, params: UpdateProfileParams);
    updateAvatar(user: User, params: UpdateProfileParams);
    updateLocation(user: User, params: UpdateProfileParams);
}
