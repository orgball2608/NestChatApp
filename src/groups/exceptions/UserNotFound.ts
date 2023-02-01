import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
    constructor() {
        super('User Not Found', HttpStatus.BAD_REQUEST);
    }
}
