import { ReactMessage } from 'src/utils/typeorm';
import {
    CreateReactGroupMessageParams,
    CreateReactGroupMessagePayload,
    CreateReactMessageParams,
    CreateReactMessagePayload,
    RemoveReactMessageParams,
    RemoveReactMessagePayload,
} from 'src/utils/types';

export interface IReactService {
    createReactMessage(params: CreateReactMessageParams): Promise<CreateReactMessagePayload>;
    createReactGroupMessage(params: CreateReactGroupMessageParams): Promise<CreateReactGroupMessagePayload>;
    findById(Id: number): Promise<ReactMessage>;
    removeReact(params: RemoveReactMessageParams): Promise<RemoveReactMessagePayload>;
    removeReactGroupMessage(params: RemoveReactMessageParams): Promise<RemoveReactMessagePayload>;
}
