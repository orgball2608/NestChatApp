import { Body, Controller, Get, HttpStatus, Inject, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Routes, Services } from '../utils/constants';
import { Request, Response } from 'express';
import { IAuthService } from './auth';
import { CreateUserDto } from './dtos/CreateUser.dto';
import { IUserService } from '../users/user';
import { instanceToPlain } from 'class-transformer';
import { AuthenticatedGuard, LocalAuthGuard } from './utils/Guards';

@Controller(Routes.AUTH)
export class AuthController {
    constructor(
        @Inject(Services.AUTH)
        private readonly authService: IAuthService,
        @Inject(Services.USERS)
        private readonly userService: IUserService,
    ) {}

    @Post('register')
    async registerUser(@Body() createUserDto: CreateUserDto) {
        return instanceToPlain(await this.userService.createUser(createUserDto));
    }
    @Post('login')
    @UseGuards(LocalAuthGuard)
    login(@Res() res: Response) {
        return res.send(HttpStatus.OK);
    }

    @Get('status')
    @UseGuards(AuthenticatedGuard)
    status(@Req() req: Request, @Res() res: Response) {
        res.send(req.user);
    }

    @Post('logout')
    logout() {}
}
