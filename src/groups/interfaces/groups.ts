import {
    AccessParams,
    ChangeGroupEmojiIconParams,
    ChangeGroupNicknameParams,
    changeOwnerParams,
    CreateGroupParams,
    EditGroupTitleParams,
    FindUserSelectOption,
    GetGroupsByIdParams,
    GetGroupsParams,
    UpdateGroupAvatarParams,
} from '../../utils/types';
import { Group, User } from '../../utils/typeorm';

export interface IGroupService {
    createGroup(params: CreateGroupParams, options?: FindUserSelectOption);
    getGroups(params: GetGroupsParams): Promise<Group[]>;
    getGroupById(params: GetGroupsByIdParams): Promise<Group>;
    saveGroup(group: Group): Promise<Group>;
    editGroupTitle(params: EditGroupTitleParams);
    hasAccess({ id, userId }: AccessParams): Promise<User>;
    updateOwner();
    changeOwner(params: changeOwnerParams): Promise<Group>;
    updateGroupAvatar(params: UpdateGroupAvatarParams): Promise<Group>;
    changeGroupEmojiIcon(params: ChangeGroupEmojiIconParams): Promise<Group>;
    changeGroupNickname(params: ChangeGroupNicknameParams): Promise<Group>;
}
