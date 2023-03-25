import { Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ServerEvents, Services } from '../utils/constants';
import { AuthenticatedSocket } from '../utils/interfaces';
import { IGatewaySessionManager } from './gateway.session';
import {
    ActionGroupRecipientResponse,
    AddGroupRecipientsResponse,
    CallAcceptedPayload,
    CreateGroupMessageResponse,
    CreateMessageResponse,
    CreateReactGroupMessagePayload,
    CreateReactMessagePayload,
    DeleteMessageParams,
    leaveGroupResponse,
    RemoveFriendEventPayload,
    RemoveReactMessagePayload,
    UpdateGroupMessageStatusPayload,
    UpdateMessageStatusPayload,
    VoiceCallPayload,
} from '../utils/types';
import { Conversation, Group, GroupMessage } from '../utils/typeorm';
import { IGroupService } from '../groups/interfaces/groups';
import { IFriendService } from 'src/friends/friends';
import { CreateCallDtoDto } from './dtos/CreateCallDto.dto';
import { VideoCallHangUpDto } from './dtos/VideoCallHangUpDto.dto';

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:3000'],
        credentials: true,
    },
    pingInterval: 10000,
    pingTimeout: 15000,
})
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        @Inject(Services.GATEWAY_SESSION_MANAGER)
        readonly sessions: IGatewaySessionManager,
        @Inject(Services.CONVERSATIONS)
        private readonly conversationService,
        @Inject(Services.GROUPS)
        private readonly groupService: IGroupService,
        @Inject(Services.FRIENDS)
        private readonly friendsService: IFriendService,
    ) {}

    handleConnection(socket: AuthenticatedSocket) {
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
    async onTypingStart(@MessageBody() data: any) {
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
    async onTypingStop(@MessageBody() data: any) {
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
        console.log('Create Message', data);
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
        const conversation = await this.conversationService.findConversationById(conversationId);
        if (!conversation) return;
        const { creator, recipient } = conversation;
        const recipientSocket =
            creator.id === payload.userId
                ? this.sessions.getUserSocket(recipient.id)
                : this.sessions.getUserSocket(creator.id);
        if (recipientSocket)
            recipientSocket.emit('onMessageDelete', {
                ...payload,
                conversation,
            });
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

    @OnEvent('group.recipients.add.many')
    handleGroupRecipientsAdd(payload: AddGroupRecipientsResponse) {
        console.log('inside group.recipients.add.many');
        const {
            group: { id },
            users,
        } = payload;

        users.forEach((user) => {
            const recipientSocket = this.sessions.getUserSocket(user.id);
            recipientSocket && recipientSocket.emit('onGroupUserAdd', payload);
        });
        this.server.to(`group-${id}`).emit('onGroupReceivedNewUser', payload);
    }

    @OnEvent('group.recipients.remove')
    handleGroupUserRemove(payload: ActionGroupRecipientResponse) {
        const {
            group: { id },
        } = payload;
        console.log('inside group.user.remove');
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
    handleLeaveGroup(payload: leaveGroupResponse) {
        const { savedGroup, userId } = payload;
        const socket = this.sessions.getUserSocket(userId);
        socket && socket.emit('onLeaveGroup', payload);
        socket && socket.leave(`group-${savedGroup.id}`);
        this.server.to(`group-${savedGroup.id}`).emit('onGroupUserLeave', payload);
    }

    @SubscribeMessage('getOnlineFriends')
    async handleGetOnlineFriends(@MessageBody() data: any, @ConnectedSocket() socket: AuthenticatedSocket) {
        console.log('handleGetOnlineFriends');
        const { user } = socket;
        if (user) {
            const friends = await this.friendsService.getFriends(user);
            if (!friends) return;
            const onlineFriends = [];
            const offlineFriends = [];
            for (let i = 0; i < friends.length; i++) {
                const friend = friends[i].receiver.id === user.id ? friends[i].sender : friends[i].receiver;
                const socket = this.sessions.getUserSocket(friend.id);
                socket ? onlineFriends.push(friend) : offlineFriends.push(friend);
            }
            socket.emit('getStatusFriends', { onlineFriends, offlineFriends });
        }
    }

    @OnEvent(ServerEvents.FRIEND_REMOVED)
    removedFriend(payload: RemoveFriendEventPayload) {
        const { userId, friend } = payload;
        console.log('inside friend.removed');
        const { sender, receiver } = friend;
        const friendSocket = this.sessions.getUserSocket(sender.id === userId ? receiver.id : sender.id);
        friendSocket && friendSocket.emit('onFriendRemoved', payload);
    }

    @OnEvent('group.avatar.update')
    updateGroupAvatar(payload) {
        console.log('inside group.avatar.update');
        this.server.to(`group-${payload.id}`).emit('onGroupUpdateAvatar', payload);
    }

    @OnEvent('messages.reaction')
    async messageReaction(payload: CreateReactMessagePayload) {
        console.log('inside messages.reaction');
        const { conversationId, message } = payload;
        const conversation = await this.conversationService.findConversationById(conversationId);
        if (!conversation) return;
        const { creator, recipient } = conversation;
        const recipientSocket = this.sessions.getUserSocket(recipient.id);
        const creatorSocket = this.sessions.getUserSocket(creator.id);
        if (recipientSocket)
            recipientSocket.emit('onReactMessage', {
                message,
                conversation,
            });
        if (creatorSocket)
            creatorSocket.emit('onReactMessage', {
                message,
                conversation,
            });
    }

    @OnEvent('group.messages.reaction')
    async groupMessageReaction(payload: CreateReactGroupMessagePayload) {
        console.log('inside group.messages.reaction');
        const { groupId, message } = payload;
        const {
            author: { id: authorId },
        } = message;
        const group = await this.groupService.getGroupById({ id: groupId, userId: authorId });
        if (!group) return;
        this.server.to(`group-${group.id}`).emit('onReactGroupMessage', {
            message,
            group,
        });
    }

    @OnEvent('messages.reaction.remove')
    async RemoveMessageReaction(payload: RemoveReactMessagePayload) {
        console.log('inside messages.reaction.remove');
        const { id, message } = payload;
        const conversation = await this.conversationService.findConversationById(id);
        if (!conversation) return;
        const { creator, recipient } = conversation;
        const recipientSocket = this.sessions.getUserSocket(recipient.id);
        const creatorSocket = this.sessions.getUserSocket(creator.id);
        if (recipientSocket)
            recipientSocket.emit('onReactMessageRemove', {
                message,
                conversation,
            });
        if (creatorSocket)
            creatorSocket.emit('onReactMessageRemove', {
                message,
                conversation,
            });
    }

    @OnEvent('group.messages.reaction.remove')
    async removeGroupMessageReaction(payload: RemoveReactMessagePayload) {
        console.log('inside group.messages.reaction.remove');
        const { id, message } = payload;
        const {
            author: { id: authorId },
        } = message;
        const group = await this.groupService.getGroupById({ id, userId: authorId });
        if (!group) return;
        this.server.to(`group-${group.id}`).emit('onReactGroupMessageRemove', {
            message,
            group,
        });
    }

    @OnEvent('conversation.emoji.change')
    async changeConversationEmoji(payload: Conversation) {
        console.log('inside conversation.emoji.change');
        const { id } = payload;
        const conversation = await this.conversationService.findConversationById(id);
        if (!conversation) return;
        const { creator, recipient } = conversation;
        const recipientSocket = this.sessions.getUserSocket(recipient.id);
        const creatorSocket = this.sessions.getUserSocket(creator.id);
        if (recipientSocket) recipientSocket.emit('onChangeConversationEmoji', conversation);
        if (creatorSocket) creatorSocket.emit('onChangeConversationEmoji', conversation);
    }

    @OnEvent('group.emoji.change')
    async changeGroupEmoji(payload: Group) {
        console.log('inside group.emoji.change');
        const { id } = payload;
        this.server.to(`group-${id}`).emit('onChangeGroupEmoji', payload);
    }

    @OnEvent('conversation.nickname.change')
    async changeConversationNickname(payload: Conversation) {
        console.log('inside conversation.nickname.change');
        const { id } = payload;
        const conversation = await this.conversationService.findConversationById(id);
        if (!conversation) return;
        const { creator, recipient } = conversation;
        const recipientSocket = this.sessions.getUserSocket(recipient.id);
        const creatorSocket = this.sessions.getUserSocket(creator.id);
        if (recipientSocket) recipientSocket.emit('onChangeConversationNickname', payload);
        if (creatorSocket) creatorSocket.emit('onChangeConversationNickname', payload);
    }

    @OnEvent('group.nickname.change')
    async changeGroupNickname(payload: Group) {
        console.log('inside group.emoji.change');
        const { id } = payload;
        this.server.to(`group-${id}`).emit('onChangeGroupNickname', payload);
    }

    @OnEvent('conversation.theme.change')
    async changeConversationTheme(payload: Conversation) {
        console.log('inside conversation.theme.change');
        const { id } = payload;
        const conversation = await this.conversationService.findConversationById(id);
        if (!conversation) return;
        const { creator, recipient } = conversation;
        const recipientSocket = this.sessions.getUserSocket(recipient.id);
        const creatorSocket = this.sessions.getUserSocket(creator.id);
        if (recipientSocket) recipientSocket.emit('onChangeConversationTheme', conversation);
        if (creatorSocket) creatorSocket.emit('onChangeConversationTheme', conversation);
    }

    @OnEvent('group.theme.change')
    async changeGroupTheme(payload: Group) {
        console.log('inside group.theme.change');
        const { id } = payload;
        this.server.to(`group-${id}`).emit('onChangeGroupTheme', payload);
    }

    @OnEvent('message.status.update')
    async updateMessageStatus(payload: UpdateMessageStatusPayload) {
        console.log('message.status.update');
        const { conversationId, message } = payload;
        const conversation = await this.conversationService.findConversationById(conversationId);
        if (!conversation) return;
        const { creator, recipient } = conversation;
        const recipientSocket = this.sessions.getUserSocket(recipient.id);
        const creatorSocket = this.sessions.getUserSocket(creator.id);
        if (recipientSocket)
            recipientSocket.emit('onUpdateMessageStatus', {
                message,
                conversation,
            });
        if (creatorSocket)
            creatorSocket.emit('onUpdateMessageStatus', {
                message,
                conversation,
            });
    }

    @OnEvent('group.message.status.update')
    async updateGroupMessageStatus(payload: UpdateGroupMessageStatusPayload) {
        console.log('inside group.message.status.update');
        const { groupId, message } = payload;
        const {
            author: { id: authorId },
        } = message;
        const group = await this.groupService.getGroupById({ id: groupId, userId: authorId });
        if (!group) return;
        this.server.to(`group-${group.id}`).emit('onUpdateGroupMessageStatus', {
            message,
            group,
        });
    }

    @SubscribeMessage('onVideoCallCreated')
    async handleVideoCall(@MessageBody() data: CreateCallDtoDto, @ConnectedSocket() socket: AuthenticatedSocket) {
        console.log('onVideoCallCreated');
        const { recipientId } = data;
        const caller = socket.user;
        const receiver = this.sessions.getUserSocket(recipientId);
        if (!receiver) socket.emit('onUserUnavailable');
        receiver.emit('onVideoCall', { ...data, caller });
    }

    @SubscribeMessage('videoCallAccepted')
    async handleVideoCallAccepted(@MessageBody() data, @ConnectedSocket() socket: AuthenticatedSocket) {
        const callerSocket = this.sessions.getUserSocket(data.caller.id);
        const conversation = await this.conversationService.isCreated(data.caller.id, socket.user.id);
        if (!conversation) return console.log('No conversation found');
        if (callerSocket) {
            console.log('Emitting onVideoCallAccept event');
            const payload = { ...data, conversation, acceptor: socket.user };
            callerSocket.emit('onVideoCallAccept', payload);
            socket.emit('onVideoCallAccept', payload);
        }
    }

    @SubscribeMessage('videoCallRejected')
    async handleVideoCallRejected(@MessageBody() data, @ConnectedSocket() socket: AuthenticatedSocket) {
        console.log('videoCallRejected');
        const callerSocket = this.sessions.getUserSocket(data.caller.id);
        const receiver = socket.user;
        if (callerSocket) {
            callerSocket.emit('onVideoCallRejected', receiver);
            socket.emit('onVideoCallRejected', receiver);
        }
    }

    @SubscribeMessage('videoCallHangUp')
    async handleVideoCallHangUp(
        @MessageBody() { caller, receiver }: VideoCallHangUpDto,
        @ConnectedSocket() socket: AuthenticatedSocket,
    ) {
        if (socket.user.id === caller.id) {
            const receiverSocket = this.sessions.getUserSocket(receiver.id);
            socket.emit('onVideoCallHangUp');
            return receiverSocket && receiverSocket.emit('onVideoCallHangUp');
        }
        socket.emit('onVideoCallHangUp');
        const callerSocket = this.sessions.getUserSocket(caller.id);
        callerSocket && callerSocket.emit('onVideoCallHangUp');
    }

    @SubscribeMessage('onVoiceCallInitiate')
    async handleVoiceCallInitiate(
        @MessageBody() payload: VoiceCallPayload,
        @ConnectedSocket() socket: AuthenticatedSocket,
    ) {
        const caller = socket.user;
        const receiverSocket = this.sessions.getUserSocket(payload.recipientId);
        if (!receiverSocket) socket.emit('onUserUnavailable');
        receiverSocket.emit('onVoiceCall', { ...payload, caller });
    }

    @SubscribeMessage('voiceCallAccepted')
    async handleVoiceCallAccepted(
        @MessageBody() payload: CallAcceptedPayload,
        @ConnectedSocket() socket: AuthenticatedSocket,
    ) {
        console.log('Inside onVoiceCallAccepted event');
        const callerSocket = this.sessions.getUserSocket(payload.caller.id);
        const conversation = await this.conversationService.isCreated(payload.caller.id, socket.user.id);
        if (!conversation) return console.log('No conversation found');
        if (callerSocket) {
            console.log('Emitting onVoiceCallAccepted event');
            const callPayload = { ...payload, conversation, acceptor: socket.user };
            callerSocket.emit('onVoiceCallAccepted', callPayload);
            socket.emit('onVoiceCallAccepted', callPayload);
        }
    }

    @SubscribeMessage('voiceCallHangUp')
    async handleVoiceCallHangUp(
        @MessageBody() { caller, receiver }: VideoCallHangUpDto,
        @ConnectedSocket() socket: AuthenticatedSocket,
    ) {
        console.log('inside onVoiceCallHangUp event');
        if (socket.user.id === caller.id) {
            const receiverSocket = this.sessions.getUserSocket(receiver.id);
            socket.emit('onVoiceCallHangUp');
            return receiverSocket && receiverSocket.emit('onVoiceCallHangUp');
        }
        socket.emit('onVoiceCallHangUp');
        const callerSocket = this.sessions.getUserSocket(caller.id);
        callerSocket && callerSocket.emit('onVoiceCallHangUp');
    }

    @SubscribeMessage('voiceCallRejected')
    async handleVoiceCallRejected(@MessageBody() data, @ConnectedSocket() socket: AuthenticatedSocket) {
        console.log('inside onVoiceCallRejected event');
        const receiver = socket.user;
        const callerSocket = this.sessions.getUserSocket(data.caller.id);
        callerSocket && callerSocket.emit('onVoiceCallRejected', { receiver });
        socket.emit('onVoiceCallRejected', { receiver });
    }
}
