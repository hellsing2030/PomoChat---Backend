import { Injectable, OnModuleInit } from '@nestjs/common';
import * as tmi from 'tmi.js';
import { CommandHandler } from '../components/command.handler';

@Injectable()
export class TwitchService implements OnModuleInit {
  private client: tmi.Client;

  constructor(private readonly commandHandler: CommandHandler) {}

  onModuleInit() {
    this.connectToTwitch();
  }

  private connectToTwitch() {
    const channels = process.env.CHANNELS
      ? process.env.CHANNELS.split(',')
      : [];
    const options = {
      options: { debug: true },
      connection: { reconnect: true, secure: true },
      identity: {
        username: 'hellsing2030bot',
        password: `${process.env.TOKEN}`,
      },
      channels: channels,
    };

    this.client = new tmi.Client(options);

    this.client.on('message', (channel, tags, message, self) => {
      if (self) return;
      this.commandHandler.handleCommand(this.client, channel, tags, message);
    });

    this.client
      .connect()
      .then(
        () => console.log('Conectado a Twitch Chat'),
        this.client.on('', (channels) => {
          console.log(channels);
          this.client.say(channels, 'test');
        }),
      )
      .catch((error) => console.error('Error al conectar con Twitch:', error));
  }
}
