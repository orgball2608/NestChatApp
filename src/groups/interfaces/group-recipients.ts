import { Group } from 'src/utils/typeorm';
import {
    ActionGroupRecipientResponse,
    AddGroupRecipientParams,
    AddGroupRecipientsParams,
    AddGroupRecipientsResponse,
    CheckUserInGroupParams,
    leaveGroupParams,
    leaveGroupResponse,
    RemoveGroupRecipientParams,
} from '../../utils/types';

export interface IGroupRecipientService {
    addGroupRecipient(params: AddGroupRecipientParams): Promise<ActionGroupRecipientResponse>;
    addGroupRecipients(params: AddGroupRecipientsParams): Promise<AddGroupRecipientsResponse>;
    removeGroupRecipient(params: RemoveGroupRecipientParams): Promise<ActionGroupRecipientResponse>;
    leaveGroup(params: leaveGroupParams): Promise<leaveGroupResponse>;
    isUserInGroup(params: CheckUserInGroupParams): Promise<Group>;
}
