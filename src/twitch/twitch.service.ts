import { Injectable, OnModuleInit } from '@nestjs/common';
import * as tmi from 'tmi.js';

@Injectable()
export class TwitchService implements OnModuleInit {
  private client: tmi.Client;

  onModuleInit() {
    this.connectToTwitch();
  }

  private connectToTwitch() {
    console.log(process.env.TOKEN, 'khsgfduabsfhj');
    const options = {
      options: { debug: true },
      connection: {
        reconnect: true,
        secure: true,
      },
      identity: {
        username: 'hellsing2030bot',
        password: `${process.env.TOKEN}`,
      },
      channels: ['hellsing2030_'],
    };

    this.client = new tmi.Client(options);

    this.client.on('message', (channel, tags, message, self) => {
      console.log({ channel }, { tags }, { message }, { self });
      if (self) return;
      if (message.toLowerCase() === '!hola') {
        this.client.say(
          channel,
          `¡Hola! Soy el bot de Hellsing y estoy en proceso de creación. Les pido un poco de paciencia, ya que pronto vendré con nuevas y emocionantes características.
¡Gracias por su apoyo y nos vemos pronto! ${tags['display-name']}! 👋`,
        );
      }
    });

    this.client
      .connect()
      .then(() => console.log('Conectado a Twitch Chat'))
      .catch((error) => console.error('Error al conectar con Twitch:', error));
  }
}
