import { HttpException, HttpStatus } from '@nestjs/common';

export class FriendNotFoundException extends HttpException {
    constructor() {
        super('Friend Not Found', HttpStatus.BAD_REQUEST);
    }
}
