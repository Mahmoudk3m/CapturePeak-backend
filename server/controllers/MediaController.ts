import { Request, Response } from "express";

import Media from "../models/Post";
import User from "../models/User";
import Likes from "../models/Likes";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

function isImage(file: string) {
  return file.includes("data:image");
}

function isVideo(file: string) {
  return file.includes("data:video");
}

export class MediaController {
  public async uploadMedia(req: Request, res: Response): Promise<Response> {
    try {
      const { title, description, file, username } = req.body;
      let uploadedFile;
      if (isImage(file)) {
        uploadedFile = await cloudinary.uploader.upload(file, { folder: "media" });
      } else if (isVideo(file)) {
        uploadedFile = await cloudinary.uploader.upload(file, { resource_type: "video", folder: "media" });
      } else {
        return res.status(400).json({ message: "Invalid file type" });
      }
      const user = await User.findOne({ username });
      const authorId = user ? user._id : null;

      const newMedia = new Media({
        title,
        description,
        path: uploadedFile.secure_url,
        authorId,
        cloudinaryPublicId: uploadedFile.public_id
      });
      await newMedia.save();
      return res.status(201).json(newMedia);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async listMedia(req: Request, res: Response): Promise<Response> {
    try {
      const media = await Media.find();
      return res.status(200).json(media);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async reactMedia(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { action } = req.query;
      const { username } = req.body;
      const user = await User.findOne({ username });
      const userId = user ? user._id : null;
      const like = await Likes.findOne({ userId, postId: id });

      const post = await Media.findById(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (action === "add") {
        if (like) {
          return res.status(400).json({ message: "You have already liked this post" });
        }
        const newLike = new Likes({ userId, postId: id });
        await newLike.save();
        post.likes += 1;
        await post.save();
        return res.status(201).json(newLike);
      } else if (action === "remove") {
        if (!like) {
          return res.status(400).json({ message: "You have not liked this post" });
        }
        await Likes.findByIdAndDelete(like._id);
        post.likes -= 1;
        await post.save();
        return res.status(200).json({ message: "Post unliked successfully" });
      } else {
        return res.status(400).json({ message: "Invalid action" });
      }
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async deleteMedia(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { username } = req.body;
      const user = await User.findOne({ username });
      const userId = user ? user._id : null;
      const post = await Media.findById(id);

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (!userId.equals(post.authorId)) {
        return res.status(403).json({ message: "You are not authorized to delete this post" });
      }

      // Delete the media file from Cloudinary
      if (post.cloudinaryPublicId) {
        await cloudinary.uploader.destroy(post.cloudinaryPublicId);
      }

      // Delete the post from the database
      await Media.findByIdAndDelete(id);

      // Delete all likes associated with the post
      await Likes.deleteMany({ postId: id });

      return res.status(200).json({ message: "Post deleted successfully" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
