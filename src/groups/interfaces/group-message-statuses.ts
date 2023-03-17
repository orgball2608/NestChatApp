import { UpdateGroupMessageStatus, UpdateGroupMessageStatusPayload } from '../../utils/types';

export interface IGroupMessageStatusService {
    updateMessageStatus(params: UpdateGroupMessageStatus): Promise<UpdateGroupMessageStatusPayload>;
}
