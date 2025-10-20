import { Module } from '@nestjs/common';
import { TwitchModule } from './twitch/twitch.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomCommandsChanelsModule } from './custom-commands-chanels/custom-commands-chanels.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL),
    TwitchModule,
    CustomCommandsChanelsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
