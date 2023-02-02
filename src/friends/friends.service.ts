import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Friend } from 'src/utils/typeorm';
import { Repository } from 'typeorm';
import { IFriendService } from './friends';

@Injectable()
export class FriendsService implements IFriendService {
    constructor(@InjectRepository(Friend) private readonly friendRepository: Repository<Friend>) {}
}
