import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

class CommndsState {
  @Prop({ require: true })
  key: string;
  @Prop({ require: true })
  active: boolean;
}

export type CommandsChannelsDocument = CommandsChannel & Document;

@Schema()
export class CommandsChannel extends Document {
  @Prop({ unique: true, require: true })
  channels: string;

  @Prop({ require: true })
  commands: CommndsState[];
}

export const CommandsChannelsSchema =
  SchemaFactory.createForClass(CommandsChannel);
