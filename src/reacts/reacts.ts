import { ReactMessage } from 'src/utils/typeorm';
import {
    CreateReactGroupMessageParams,
    CreateReactGroupMessagePayload,
    CreateReactMessageParams,
    CreateReactMessagePayload,
} from 'src/utils/types';

export interface IReactService {
    createReactMessage(params: CreateReactMessageParams): Promise<CreateReactMessagePayload>;
    createReactGroupMessage(params: CreateReactGroupMessageParams): Promise<CreateReactGroupMessagePayload>;
    findById(Id: number): Promise<ReactMessage>;
}
