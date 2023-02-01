import { HttpException, HttpStatus } from '@nestjs/common';

export class FriendRequestNotFoundException extends HttpException {
    constructor() {
        super('Friend Request Not Found', HttpStatus.BAD_REQUEST);
    }
}
