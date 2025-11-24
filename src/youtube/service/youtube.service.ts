import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class YoutubeService implements OnModuleInit {
  constructor() {}
  private readonly logger = new Logger(YoutubeService.name);

  youtubeSettings = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY,
  });

  async onModuleInit() {
    this.logger.log(
      'onModuleInit() EJECUTADO - YouTube service initialization',
    );
    this.logger.debug(
      `YOUTUBE_API_KEY existe: ${!!process.env.YOUTUBE_API_KEY}`,
    );
    this.logger.debug(
      `YOUTUBE_CHANNELS: ${process.env.YOUTUBE_CHANNELS || 'NO CONFIGURADO'}`,
    );

    if (!process.env.YOUTUBE_API_KEY) {
      this.logger.error(
        "The 'YOUTUBE_API_KEY' is not in your .env file, YouTube services are disabled.",
      );
      return;
    }

    // Inicializar canales automáticamente
    this.logger.log('Llamando a initializeChanels()...');
    await this.initializeChanels();
    this.logger.log('initializeChanels() completado');
  }

  private async initializeChanels() {
    this.logger.log('initializeChanels() - Iniciando...');
    const channelsInput = process.env.YOUTUBE_CHANNELS
      ? process.env.YOUTUBE_CHANNELS.split(',').map((channel) => channel.trim())
      : [];

    this.logger.log(`Canales procesados: ${channelsInput.length}`);

    if (channelsInput.length > 0) {
      this.logger.log(`Youtube Channels Found: ${channelsInput.length}`);
      channelsInput.forEach((channelName) => {
        this.logger.log(`This channel has been detected: ${channelName}`);
      });
    } else {
      this.logger.warn('No configured channels were found in your .env');
    }
  }
  async getChannelIdFormUsername(username: string): Promise<string | null> {
    try {
      this.logger.log(` search Channel:${username} `);

      const searchResponse = await this.youtubeSettings.search.list({
        part: ['snippet'],
        q: `@${username}`,
        type: ['channel'],
        maxResults: 5,
      });

      if (!searchResponse?.data?.items) {
        this.logger.error(
          `Error searching for channel, channel may not exist: ${username}`,
        );
        return null;
      }

      const itemsListData = searchResponse.data.items;
      this.logger.debug(`itemsListData:${itemsListData}`);
    } catch {
      this.logger.error('esto es un error');
    }
  }
}
