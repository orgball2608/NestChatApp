import { Group } from 'src/utils/typeorm';
import {
    ActionGroupRecipientResponse,
    AddGroupRecipientParams,
    CheckUserInGroupParams,
    leaveGroupParams,
    RemoveGroupRecipientParams,
} from '../../utils/types';

export interface IGroupRecipientService {
    addGroupRecipient(params: AddGroupRecipientParams): Promise<ActionGroupRecipientResponse>;
    removeGroupRecipient(params: RemoveGroupRecipientParams): Promise<ActionGroupRecipientResponse>;
    leaveGroup(params: leaveGroupParams): Promise<Group>;
    isUserInGroup(params: CheckUserInGroupParams): Promise<Group>;
}
