import { HttpException, HttpStatus } from '@nestjs/common';

export class GroupOwnerTransferException extends HttpException {
    constructor(msg?: string) {
        const defaultMessage = 'Group Owner Transfer Exception';
        const errMessage = msg ? defaultMessage.concat(': ', msg) : defaultMessage;
        super(errMessage, HttpStatus.BAD_REQUEST);
    }
}
