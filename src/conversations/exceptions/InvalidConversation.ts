import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidConversationException extends HttpException {
    constructor() {
        super('Invalid Conversation Id', HttpStatus.BAD_REQUEST);
    }
}
