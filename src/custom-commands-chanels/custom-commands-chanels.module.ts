import { Module } from '@nestjs/common';
import { CustomCommandsChanelsService } from './service/custom-commands-chanels.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CommandsChannel,
  CommandsChannelsSchema,
} from './schema/custom-commands-chanels.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CommandsChannel.name, schema: CommandsChannelsSchema },
    ]),
  ],
  providers: [CustomCommandsChanelsService],
})
export class CustomCommandsChanelsModule {}
