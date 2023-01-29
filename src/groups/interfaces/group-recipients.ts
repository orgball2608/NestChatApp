import { ActionGroupRecipientResponse, AddGroupRecipientParams, RemoveGroupRecipientParams } from '../../utils/types';

export interface IGroupRecipientService {
    addGroupRecipient(params: AddGroupRecipientParams): Promise<ActionGroupRecipientResponse>;
    removeGroupRecipient(params: RemoveGroupRecipientParams): Promise<ActionGroupRecipientResponse>;
}
