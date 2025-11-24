import { Module } from '@nestjs/common';
import { YoutubeService } from './service/youtube.service';
import { TwitchModule } from '../twitch/twitch.module';

@Module({
  imports: [TwitchModule],
  providers: [YoutubeService],
})
export class YoutubeModule {}
