import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Friend } from 'src/utils/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FriendsService {
    constructor(@InjectRepository(Friend) private readonly friendRepository: Repository<Friend>) {}
}
