import { Module } from '@nestjs/common';
import { CustomCommandsChanelsService } from './service/custom-commands-chanels.service';

@Module({
  providers: [CustomCommandsChanelsService],
})
export class CustomCommandsChanelsModule {}
