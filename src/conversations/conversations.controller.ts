import {Body, Controller, Inject, Post, UseGuards} from '@nestjs/common';
import {Routes, Services} from "../utils/constants";
import {IConversationsService} from "./conversations";
import {AuthenticatedGuard} from "../auth/utils/Guards";
import {CreateConversationDto} from "./dto/CreateConversation.dto";

@Controller(Routes.CONVERSATIONS)
@UseGuards(AuthenticatedGuard)
export class ConversationsController {
    constructor(@Inject(Services.CONVERSATIONS) private readonly  conversationsService:IConversationsService) {
    }
    @Post()
    createConversation(@Body() createConversationPayload: CreateConversationDto){
        console.log(createConversationPayload)
        this.conversationsService.createConversation(createConversationPayload)
    }
}
