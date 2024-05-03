import mongoose, { Schema, Document } from "mongoose";

export interface ILike extends Document {
  userId: string;
  postId: string;
}

const LikeSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true
  },
  postId: {
    type: String,
    required: true
  }
});

export default mongoose.model<ILike>("Like", LikeSchema);
