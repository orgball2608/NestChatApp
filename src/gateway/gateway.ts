import {
    MessageBody,
    OnGatewayConnection,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:3000'],
        credentials: true,
    },
})
export class MessagingGateway implements OnGatewayConnection {
    @WebSocketServer()
    server: Server;
    handleConnection(client: Socket, ...args: any[]) {
        console.log('New Incoming Connection');
        client.emit('connected', { status: 'good' });
    }

    @SubscribeMessage('createMessage')
    handleCreateMessage(@MessageBody() data: any) {
        console.log('Create Message');
    }

    @OnEvent('message.create')
    handleMessageCreateEvent(payload: any) {
        console.log('Inside message.create');
        this.server.emit('onMessage', payload);
    }
}
