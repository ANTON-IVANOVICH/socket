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

const randomData = {
  avatars: [
    'https://i1.sndcdn.com/avatars-000294217894-fekt5p-t500x500.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoMnOEFzgpuxeaWKO_UpSjgNWEeoQ0ZAJqvwKSYNLaxuQXEPdXh3ESy7quC4FVqIRgtGE&usqp=CAU',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPlrXV7kmvyvV5G3aOvUq1u8lZDJYlDHctbA&usqp=CAU',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPc9UroSWoiRVNZIJEDv5U_y2ywkr5WmFsJQ&usqp=CAU',
    'https://steamavatar.io/img/1477353367evDTd.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEnjSRsiIR7YKgfFDjovjc4UezpKimeHaVsQ&usqp=CAU',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQNGt32j47BRxUIciGlj7yQ9_cFZ4a2zV0tQ&usqp=CAU',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6VzwmULFgVKSBebjjkA53NONhD3Pr5HxCGg&usqp=CAU',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSePwSjIkingQQj5sYHgTCuOtakCz23cflTmQ&usqp=CAU',
    'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/77/770b65b9d91544b2a87dfa576739c245193e8d60_full.jpg'
  ],
  names: [
    'Arnold',
    'Gora',
    'Patron',
    'Bomj',
    'Naruto',
    'Cop',
    'Slon',
    'Arrr',
    'Tiger',
    'Lion',
  ],
};

const room = {};

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  randomUser = (clientID) => {
    const name = randomData.names[Math.floor(Math.random() * randomData.names.length)];
    const avatar = randomData.avatars[Math.floor(Math.random() * randomData.avatars.length)];
    return { name, avatar, clientID };
  };

  formatMessage = (data, clientID) => {
    const text = data;
    const msgID = new Date().getTime();
    const time = new Date();
    const author = room[clientID].name;
    const avatar = room[clientID].avatar;
    const newMessage = { text, time, msgID, clientID, author, avatar };
    return newMessage;
  };

  handleConnection(client: any, ...args: any[]) {
    room[client.id] = this.randomUser(client.id);
    this.server.emit(
      'connectMessage',
      `User ${room[client.id].name} has connected.`,
    );
    this.server.emit('userData', room[client.id]);
    console.log(room);
  }

  handleDisconnect(client: any) {
    this.server.emit(
      'disconnectMessage',
      `User ${room[client.id].name} has disconnected.`,
    );
    delete room[client.id];
    console.log(room);
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('msg')

  listenMSG(@MessageBody() data: string, @ConnectedSocket() client: any) {
    const newMessage = this.formatMessage(data, client.id);
    this.server.emit('msg', newMessage);
    console.log(newMessage);
  }
};