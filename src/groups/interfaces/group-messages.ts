import { CreateGroupMessageParams, DeleteGroupMessageParams, getGroupMessagesParams } from '../../utils/types';

export interface IGroupMessageService {
    createGroupMessage(params: CreateGroupMessageParams);
    getGroupMessages(params: getGroupMessagesParams);
    deleteGroupMessage(params: DeleteGroupMessageParams);
}
