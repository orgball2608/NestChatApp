import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseReactMessage } from './BaseReactMessage';
import { GroupMessage } from './GroupMessage';

@Entity({ name: 'react_groups' })
export class ReactGroupMessage extends BaseReactMessage {
    @ManyToOne(() => GroupMessage, (message) => message.reacts)
    @JoinColumn()
    message: GroupMessage;
}
