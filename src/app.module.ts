import { Module } from '@nestjs/common';
import { TwitchModule } from './twitch/twitch.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), TwitchModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
