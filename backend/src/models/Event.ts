import mongoose, { Document, Model, Schema } from 'mongoose';

export interface EventDoc extends Document {
  title: string;
  description: string;
  price: number;
  date: Date;
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<EventDoc>(
  {
    title: { type: String, required: true, maxlength: 140, trim: true },
    description: { type: String, required: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true },
);

export const EventModel: Model<EventDoc> =
  mongoose.models.Event ?? mongoose.model<EventDoc>('Event', eventSchema);
