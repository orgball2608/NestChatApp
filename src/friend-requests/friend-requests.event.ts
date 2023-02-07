import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WebsocketEvents } from 'src/utils/constants';
import { MessagingGateway } from '../gateway/gateway';
import { FriendRequest } from '../utils/typeorm';

@Injectable()
export class FriendRequestsEvent {
    constructor(private readonly gateway: MessagingGateway) {}

    @OnEvent('friendrequest.create')
    friendRequestCreate(payload: FriendRequest) {
        console.log('friendrequest.create');
        const receiverSocket = this.gateway.sessions.getUserSocket(payload.receiver.id);
        if (receiverSocket) receiverSocket.emit('onFriendRequestReceived', payload);
    }

    @OnEvent(WebsocketEvents.FRIEND_REQUEST_REJECTED)
    friendRequestReject(payload: FriendRequest) {
        console.log('friendrequest.reject');
        const senderSocket = this.gateway.sessions.getUserSocket(payload.sender.id);
        if (senderSocket) senderSocket.emit(WebsocketEvents.FRIEND_REQUEST_ACCEPTED, payload);
    }
}
