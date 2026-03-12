import { Module } from '@nestjs/common';
import { TwitchModule } from './twitch/twitch.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('MONGO_URL');
        if (!uri) {
          throw new Error(
            'Error MongoDB: MONGO_URL Undefined (check .env file)',
          );
        }
        return {
          uri,
          serverSelectionTimeoutMS: 10000,
          retryWrites: true,
        };
      },
      inject: [ConfigService],
    }),
    TwitchModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
