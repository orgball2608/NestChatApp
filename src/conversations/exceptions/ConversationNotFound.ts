import { HttpException, HttpStatus } from '@nestjs/common';

export class ConversationNotFoundException extends HttpException {
    constructor() {
        super('Invalid Conversation Id', HttpStatus.BAD_REQUEST);
    }
}
