import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseReactMessage } from './BaseReactMessage';
import { Message } from './Message';

@Entity({ name: 'reacts' })
export class ReactMessage extends BaseReactMessage {
    @ManyToOne(() => Message, (message) => message.reacts)
    @JoinColumn()
    message: Message;
}
