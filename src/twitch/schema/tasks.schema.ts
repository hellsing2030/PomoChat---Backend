import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TaskDocument = Task & Document;

@Schema()
export class Task extends Document {
  @Prop({ required: true,unique:false })
  id_tasks: number;

  @Prop({ required: true })
  user: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    default: 'pendiente',
    enum: ['pendiente', 'en progreso', 'finalizada'],
  })
  status: 'pendiente' | 'en progreso' | 'finalizada';
}

export const TaskSchema = SchemaFactory.createForClass(Task);
