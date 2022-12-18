import { ValidateUserDetails } from '../utils/types';
import {User} from "../utils/typeorm";

export interface IAuthService {
  validateUser(userCredentials: ValidateUserDetails):Promise<User|null>;
}
