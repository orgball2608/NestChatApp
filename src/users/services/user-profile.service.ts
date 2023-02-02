import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from 'src/utils/typeorm';
import { Repository } from 'typeorm';
import { IUserProfileService } from '../interfaces/user-profile';

@Injectable()
export class UserProfileService implements IUserProfileService {
    constructor(@InjectRepository(Profile) private readonly profileRepository: Repository<Profile>) {}
}
