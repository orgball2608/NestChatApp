import { Inject, NestMiddleware } from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { AuthenticatedRequest } from 'src/utils/types';
import { GroupNotFoundException } from '../exceptions/GroupNotFoundException';
import { NotGroupOwnerException } from '../exceptions/NotGroupOwnerException';
import { IGroupService } from '../interfaces/groups';

export class GroupMiddleware implements NestMiddleware {
    constructor(@Inject(Services.GROUPS) private readonly groupService: IGroupService) {}
    async use(req: AuthenticatedRequest, res: Response, next: Function) {
        const { id } = req.user;
        const groupId = parseInt(req.params.id);
        if (isNaN(groupId)) throw new GroupNotFoundException();
        const params = {
            id: groupId,
            userId: id,
        };
        const user = await this.groupService.hasAccess(params);
        if (user) next();
        else throw new NotGroupOwnerException();
    }
}
