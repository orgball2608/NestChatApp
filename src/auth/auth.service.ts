import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ValidateUserDetails } from '../utils/types';
import { IUserService } from '../users/user';
import { Services } from '../utils/constants';
import { IAuthService } from './auth';
import { compareHash } from '../utils/helpers';

@Injectable()
export class AuthService implements IAuthService {
    constructor(@Inject(Services.USERS) private readonly userService: IUserService) {}

    async validateUser(userDetails: ValidateUserDetails) {
        const user = await this.userService.findUser({ email: userDetails.email }, { selectAll: true });
        if (!user) throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);
        const isPasswordValid = compareHash(userDetails.password, user.password);
        return isPasswordValid ? user : null;
    }
}
