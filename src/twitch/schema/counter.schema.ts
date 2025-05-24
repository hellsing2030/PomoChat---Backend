import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Counter extends Document {
  @Prop({ unique: true })
  id_: number;

  @Prop({ default: 0 })
  seq: number;
}

export const CounterSchema = SchemaFactory.createForClass(Counter);
