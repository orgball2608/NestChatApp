import { HttpException, HttpStatus } from '@nestjs/common';

export class NotConversationOwnerException extends HttpException {
    constructor() {
        super('Not a Conversation Owner', HttpStatus.BAD_REQUEST);
    }
}
