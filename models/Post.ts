import mongoose, { Schema, Document } from "mongoose";

export interface IMedia extends Document {
  title: string;
  path: string;
  likes: number;
  createdAt: Date;
  cloudinaryPublicId?: string;
  authorId: { type: Schema.Types.ObjectId; ref: "User" };
  liked?: boolean;
}

const MediaSchema: Schema = new Schema({
  title: { type: String, required: true },
  path: { type: String, required: true },
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  cloudinaryPublicId: { type: String, required: true },
  authorId: { type: Schema.Types.ObjectId, ref: "User" },
  liked: { type: Boolean }
});

MediaSchema.index({ title: "text" });

export default mongoose.model<IMedia>("Media", MediaSchema);
