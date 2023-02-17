import { GroupMessage } from 'src/utils/typeorm';
import {
    CreateGroupGifMessageParams,
    CreateGroupMessageParams,
    CreateGroupMessageResponse,
    CreateGroupStickerMessageParams,
    DeleteGroupMessageParams,
    EditGroupMessageParams,
    getGroupMessagesParams,
} from '../../utils/types';

export interface IGroupMessageService {
    createGroupMessage(params: CreateGroupMessageParams): Promise<CreateGroupMessageResponse>;
    getGroupMessages(params: getGroupMessagesParams): Promise<GroupMessage[]>;
    deleteGroupMessage(params: DeleteGroupMessageParams): Promise<GroupMessage[]>;
    editGroupMessage(params: EditGroupMessageParams): Promise<GroupMessage>;
    getGroupMessageById(id: number): Promise<GroupMessage>;
    save(message: GroupMessage): Promise<GroupMessage>;
    createGroupGifMessage(params: CreateGroupGifMessageParams): Promise<CreateGroupMessageResponse>;
    createGroupStickerMessage(params: CreateGroupStickerMessageParams): Promise<CreateGroupMessageResponse>;
}
