import { CreateGroupMessageParams, getGroupMessagesParams } from '../../utils/types';

export interface IGroupMessageService {
    createGroupMessage(params: CreateGroupMessageParams);
    getGroupMessages(params: getGroupMessagesParams);
}
