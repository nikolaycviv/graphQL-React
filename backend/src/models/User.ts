import mongoose, { Document, Model, Schema } from 'mongoose';

export interface UserDoc extends Document {
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDoc>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'is invalid'],
    },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

export const UserModel: Model<UserDoc> =
  mongoose.models.User ?? mongoose.model<UserDoc>('User', userSchema);
