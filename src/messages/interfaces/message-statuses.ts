import { UpdateMessageStatus, UpdateMessageStatusPayload } from '../../utils/types';

export interface IMessageStatusService {
    updateMessageStatus(params: UpdateMessageStatus): Promise<UpdateMessageStatusPayload>;
}
