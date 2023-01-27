import { Controller, Get, HttpException, HttpStatus, Inject, Query } from '@nestjs/common';
import { Services } from '../utils/constants';

@Controller('user')
export class UserController {
    constructor(@Inject(Services.USERS) private readonly userService) {}
    @Get('search')
    searchUsers(@Query('query') query: string) {
        if (!query) throw new HttpException('Provide a valid query', HttpStatus.BAD_REQUEST);
        return this.userService.searchUsers(query);
    }
}
