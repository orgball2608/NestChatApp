import { ReactMessage } from 'src/utils/typeorm';
import { CreateReactMessageParams, CreateReactMessagePayload } from 'src/utils/types';

export interface IReactService {
    createReactMessage(params: CreateReactMessageParams): Promise<CreateReactMessagePayload>;
    findById(Id: number): Promise<ReactMessage>;
}
