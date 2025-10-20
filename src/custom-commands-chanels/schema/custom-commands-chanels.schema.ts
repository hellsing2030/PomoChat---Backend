import { Prop, Schema } from '@nestjs/mongoose';

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
