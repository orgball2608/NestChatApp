import { GroupMessage } from 'src/utils/typeorm';
import {
    CreateGroupGifMessageParams,
    CreateGroupMessageParams,
    DeleteGroupMessageParams,
    EditGroupMessageParams,
    getGroupMessagesParams,
} from '../../utils/types';

export interface IGroupMessageService {
    createGroupMessage(params: CreateGroupMessageParams);
    getGroupMessages(params: getGroupMessagesParams);
    deleteGroupMessage(params: DeleteGroupMessageParams);
    editGroupMessage(params: EditGroupMessageParams);
    getGroupMessageById(id: number): Promise<GroupMessage>;
    save(message: GroupMessage): Promise<GroupMessage>;
    createGroupGifMessage(params: CreateGroupGifMessageParams);
}
