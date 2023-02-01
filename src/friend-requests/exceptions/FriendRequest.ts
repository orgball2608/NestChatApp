import { HttpException, HttpStatus } from '@nestjs/common';

export class FriendRequestException extends HttpException {
    constructor() {
        super('Cannot Send Friend Request', HttpStatus.BAD_REQUEST);
    }
}
