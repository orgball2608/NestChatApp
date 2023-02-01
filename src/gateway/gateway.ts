import { Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    OnGatewayConnection,
    ConnectedSocket,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Services } from '../utils/constants';
import { AuthenticatedSocket } from '../utils/interfaces';
import { IGatewaySessionManager } from './gateway.session';
import {
    ActionGroupRecipientResponse,
    CreateGroupMessageResponse,
    CreateMessageResponse,
    DeleteMessageParams,
} from '../utils/types';
import { Conversation, GroupMessage } from '../utils/typeorm';
import { IGroupService } from '../groups/interfaces/groups';

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:3000'],
        credentials: true,
    },
})
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        @Inject(Services.GATEWAY_SESSION_MANAGER)
        private readonly sessions: IGatewaySessionManager,
        @Inject(Services.CONVERSATIONS)
        private readonly conversationService,
        @Inject(Services.GROUPS)
        private readonly groupService: IGroupService,
    ) {}

    handleConnection(socket: AuthenticatedSocket, ...args: any[]) {
        this.sessions.setUserSocket(socket.user.id, socket);
        console.log('new coming connect');
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
        client.to(data.conversationId).emit('userLeave');
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

    @SubscribeMessage('onGroupJoin')
    onGroupJoin(@MessageBody() data: any, @ConnectedSocket() client: AuthenticatedSocket) {
        console.log('onGroupJoin');
        client.join(`group-${data.groupId}`);
        client.to(`group-${data.groupId}`).emit('userGroupJoin');
    }
    @SubscribeMessage('onGroupLeave')
    onGroupLeave(@MessageBody() data: any, @ConnectedSocket() client: AuthenticatedSocket) {
        console.log('onGroupJoin');
        client.leave(`group-${data.groupId}`);
        client.to(`group-${data.groupId}`).emit('userGroupLeave');
    }

    @OnEvent('group.message.create')
    async handleGroupMessageCreateEvent(payload: CreateGroupMessageResponse) {
        console.log('Inside group.message.create');
        const { id } = payload.group;
        this.server.to(`group-${id}`).emit('onGroupMessage', payload);
    }

    @OnEvent('group.create')
    handleGroupCreateEvent(payload) {
        console.log('Inside group.create');
        payload.users.forEach((user) => {
            const socket = this.sessions.getUserSocket(user.id);
            socket && socket.emit('onGroupCreate', payload);
        });
    }

    @OnEvent('group.message.delete')
    handleGroupMessageDelete(payload) {
        console.log('Inside group.message.delete');
        const { groupId } = payload;
        this.server.to(`group-${groupId}`).emit('onDeleteGroupMessage', payload);
    }

    @OnEvent('group.message.update')
    async handleGroupMessageUpdateEvent(payload: GroupMessage) {
        console.log('Inside group.message.update');
        const { id } = payload.group;
        this.server.to(`group-${id}`).emit('onEditGroupMessage', payload);
    }

    handleDisconnect(socket: AuthenticatedSocket) {
        console.log('handleDisconnect');
        console.log(`${socket.user.email} disconnected.`);
        this.sessions.removeUserSocket(socket.user.id);
    }

    @SubscribeMessage('getOnlineGroupUsers')
    async handleGetOnlineGroupUsers(@MessageBody() data: any, @ConnectedSocket() socket: AuthenticatedSocket) {
        console.log('handleGetOnlineGroupUsers');
        const { groupId, userId } = data;
        const group = await this.groupService.getGroupById({ id: parseInt(groupId), userId });
        if (!group) return;
        const onlineUsers = [];
        const offlineUsers = [];
        group.users.forEach((user) => {
            const socket = this.sessions.getUserSocket(user.id);
            socket ? onlineUsers.push(user) : offlineUsers.push(user);
        });

        socket.emit('onlineGroupUsersReceived', { onlineUsers, offlineUsers });
    }

    @OnEvent('group.recipients.add')
    handleGroupUserAdd(payload: ActionGroupRecipientResponse) {
        const {
            group: { id },
        } = payload;
        console.log('inside group.user.add');
        const recipientSocket = this.sessions.getUserSocket(payload.user.id);
        recipientSocket && recipientSocket.emit('onGroupUserAdd', payload);
        this.server.to(`group-${id}`).emit('onGroupReceivedNewUser', payload);
    }

    @OnEvent('group.recipients.remove')
    handleGroupUserRemove(payload: ActionGroupRecipientResponse) {
        const {
            group: { id },
        } = payload;
        console.log('inside group.user.remove');
        const recipientSocket = this.sessions.getUserSocket(payload.user.id);
        if (recipientSocket) {
            recipientSocket.emit('onGroupRemoved', payload);
            recipientSocket.leave(`group-${id}`);
        }
        this.server.to(`group-${id}`).emit('onGroupRemovedUser', payload);
    }

    @OnEvent('group.title.edit')
    handleGroupTitleEdit(payload) {
        const { id } = payload;
        this.server.to(`group-${id}`).emit('onEditGroupTitle', payload);
    }

    @OnEvent('group.owner.change')
    handleGroupOwnerChange(payload) {
        const { id } = payload;
        this.server.to(`group-${id}`).emit('onGroupOwnerChange', payload);
    }

    @OnEvent('group.user.leave')
    handleLeaveGroup(payload) {
        const { id } = payload;
        this.server.to(`group-${id}`).emit('onGroupLeave', payload);
    }
}
