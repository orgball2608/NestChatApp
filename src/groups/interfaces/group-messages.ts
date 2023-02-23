import { GroupMessage } from 'src/utils/typeorm';
import {
    CreateGroupGifMessageParams,
    CreateGroupMessageParams,
    CreateGroupMessageResponse,
    CreateGroupStickerMessageParams,
    CreateReplyGroupMessageParams,
    DeleteGroupMessageParams,
    EditGroupMessageParams,
    getGroupMessagesParams,
    getGroupMessagesWithLimitParams,
} from '../../utils/types';

export interface IGroupMessageService {
    createGroupMessage(params: CreateGroupMessageParams): Promise<CreateGroupMessageResponse>;
    getGroupMessages(params: getGroupMessagesParams): Promise<GroupMessage[]>;
    getGroupMessagesWithLimit(params: getGroupMessagesWithLimitParams): Promise<GroupMessage[]>;
    deleteGroupMessage(params: DeleteGroupMessageParams): Promise<GroupMessage[]>;
    editGroupMessage(params: EditGroupMessageParams): Promise<GroupMessage>;
    getGroupMessageById(id: number): Promise<GroupMessage>;
    save(message: GroupMessage): Promise<GroupMessage>;
    createGroupGifMessage(params: CreateGroupGifMessageParams): Promise<CreateGroupMessageResponse>;
    createGroupStickerMessage(params: CreateGroupStickerMessageParams): Promise<CreateGroupMessageResponse>;
    createReplyGroupMessage(params: CreateReplyGroupMessageParams): Promise<CreateGroupMessageResponse>;
    getGroupMessagesLength(id: number): Promise<number>;
}
