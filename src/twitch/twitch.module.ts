import { Module } from '@nestjs/common';
import { TwitchService } from './services/twitch.service';
import { CommandHandler } from './components/command.handler';
import { TaskService } from './services/TaskService.service';

@Module({
  providers: [TwitchService, CommandHandler, TaskService],
})
export class TwitchModule {}
