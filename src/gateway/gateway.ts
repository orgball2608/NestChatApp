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
import { CreateMessageResponse, DeleteMessageParams } from '../utils/types';
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
        @Inject(Services.CONVERSATIONS)
        private readonly conversationService,
    ) {}

    handleConnection(socket: AuthenticatedSocket, ...args: any[]) {
        this.sessions.setUserSocket(socket.user.id, socket);
        socket.emit('connected');
    }
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('onConversationJoin')
    onConversationJoin(@MessageBody() data: any, @ConnectedSocket() client: AuthenticatedSocket) {
        client.to(data.conversationId).emit('userJoin');
    }

    @SubscribeMessage('onConversationLeave')
    onConversationLeave(@MessageBody() data: any, @ConnectedSocket() client: AuthenticatedSocket) {
        client.to(data.conversationId).emit('userJoin');
    }

    @SubscribeMessage('onTypingStart')
    async onTypingStart(@MessageBody() data: any, @ConnectedSocket() client: AuthenticatedSocket) {
        const conversation = await this.conversationService.findConversationById(data.conversationId);
        if (!conversation) return;
        const { creator, recipient } = conversation;
        const recipientSocket =
            creator.id === data.userId
                ? this.sessions.getUserSocket(recipient.id)
                : this.sessions.getUserSocket(creator.id);
        if (recipientSocket) recipientSocket.emit('onTypingStart');
    }

    @SubscribeMessage('onTypingStop')
    async onTypingStop(@MessageBody() data: any, @ConnectedSocket() client: AuthenticatedSocket) {
        const conversation = await this.conversationService.findConversationById(data.conversationId);
        if (!conversation) return;
        const { creator, recipient } = conversation;
        const recipientSocket =
            creator.id === data.userId
                ? this.sessions.getUserSocket(recipient.id)
                : this.sessions.getUserSocket(creator.id);
        if (recipientSocket) recipientSocket.emit('onTypingStop');
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

    @OnEvent('message.delete')
    async handleMessageDeleteEvent(payload: DeleteMessageParams) {
        console.log('Inside message.delete');
        const { conversationId } = payload;
        const conversation = await this.conversationService.findConversationById({ conversationId });
        if (!conversation) return;
        const { creator, recipient } = conversation;
        const recipientSocket =
            creator.id === payload.userId
                ? this.sessions.getUserSocket(recipient.id)
                : this.sessions.getUserSocket(creator.id);
        if (recipientSocket) recipientSocket.emit('onMessageDelete', payload);
    }

    @OnEvent('message.edit')
    async handleMessageEditEvent(payload) {
        console.log('Inside message.edit');
        const {
            conversation: { creator, recipient },
            author,
        } = payload;
        const recipientSocket =
            creator.id === author.id
                ? this.sessions.getUserSocket(recipient.id)
                : this.sessions.getUserSocket(creator.id);
        if (recipientSocket) recipientSocket.emit('onMessageUpdate', payload);
    }
}
