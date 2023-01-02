import { Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    OnGatewayConnection,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Services } from '../utils/constants';
import { AuthenticatedSocket } from '../utils/interfaces';
import { IGatewaySessionManager } from './gateway.session';
import { CreateMessageResponse } from '../utils/types';
import { Conversation } from '../utils/typeorm';

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:3000'],
        credentials: true,
    },
})
export class MessagingGateway implements OnGatewayConnection {
    constructor(
        @Inject(Services.GATEWAY_SESSION_MANAGER)
        private readonly sessions: IGatewaySessionManager,
    ) {}

    handleConnection(socket: AuthenticatedSocket, ...args: any[]) {
        console.log('New Incoming Connection');
        console.log(socket.user);
        this.sessions.setUserSocket(socket.user.id, socket);
        socket.emit('connected', { status: 'good' });
    }
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('onClientConnect')
    onClientConnect(@MessageBody() data: any, @ConnectedSocket() client: AuthenticatedSocket) {
        console.log('onClientConnect');
        console.log(data);
        console.log(client.user);
    }

    @SubscribeMessage('createMessage')
    handleCreateMessage(@MessageBody() data: any) {
        console.log('Create Message');
    }

    @OnEvent('message.create')
    handleMessageCreateEvent(payload: CreateMessageResponse) {
        console.log('Inside message.create');
        const {
            author,
            conversation: { creator, recipient },
        } = payload.message;

        const authorSocket = this.sessions.getUserSocket(author.id);
        const recipientSocket =
            author.id === creator.id
                ? this.sessions.getUserSocket(recipient.id)
                : this.sessions.getUserSocket(creator.id);

        if (authorSocket) authorSocket.emit('onMessage', payload);
        if (recipientSocket) recipientSocket.emit('onMessage', payload);
    }
    @OnEvent('conversation.create')
    handleConversationCreateEvent(payload: Conversation) {
        console.log('Inside conversation.create');
        const recipientSocket = this.sessions.getUserSocket(payload.recipient.id);
        if (recipientSocket) recipientSocket.emit('onConversation', payload);
    }
}
