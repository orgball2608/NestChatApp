import { Inject, NestMiddleware } from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { AuthenticatedRequest } from 'src/utils/types';
import { IConversationsService } from '../conversations';
import { InvalidConversationException } from '../exceptions/InvalidConversation';
import { NotConversationOwnerException } from '../exceptions/NotConversationOwner';

export class ConversationMiddleware implements NestMiddleware {
    constructor(@Inject(Services.CONVERSATIONS) private readonly conversationService: IConversationsService) {}
    async use(req: AuthenticatedRequest, res: Response, next: Function) {
        const { id } = req.user;
        const conversationId = parseInt(req.params.id);
        if (isNaN(conversationId)) throw new InvalidConversationException();
        const params = {
            conversationId,
            userId: id,
        };
        const hasAccess = await this.conversationService.hasAccess(params);
        if (hasAccess) next();
        else throw new NotConversationOwnerException();
    }
}
