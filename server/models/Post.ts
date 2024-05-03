import mongoose, { Schema, Document } from "mongoose";

export interface IMedia extends Document {
  title: string;
  description: string;
  path: string;
  likes: number;
  createdAt: Date;
  authorId: Schema.Types.ObjectId;
  cloudinaryPublicId?: string;
}

const MediaSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: false },
  path: { type: String, required: true },
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  authorId: { type: Schema.Types.ObjectId, ref: "User" },
  cloudinaryPublicId: { type: String, required: true }
});

// Indexes improve the efficiency of search operations.
MediaSchema.index({ title: "text", description: "text" });

export default mongoose.model<IMedia>("Media", MediaSchema);
