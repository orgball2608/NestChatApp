import { Injectable } from '@nestjs/common';
import { IUserService } from './user';
import { CreateUserDetails } from 'src/utils/types';

@Injectable()
export class UserService implements IUserService {
  createUser(UserDetails: CreateUserDetails) {
    console.log('UserDetails');
  }
}
