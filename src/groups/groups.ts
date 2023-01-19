import { CreateGroupParams, GetGroupsByIdParams, GetGroupsParams } from '../utils/types';

export interface IGroupService {
    createGroup(params: CreateGroupParams);
    getGroups(params: GetGroupsParams);
    getGroupById(params: GetGroupsByIdParams);
}
