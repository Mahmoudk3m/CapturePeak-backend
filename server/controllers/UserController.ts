import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import jwt from "jsonwebtoken";

import { v2 as cloudinary } from "cloudinary";
import { RequestWithUser } from "../types";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export class UserController {
  public async register(req: Request, res: Response): Promise<Response> {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error("JWT_SECRET is not defined");
      }

      const { username, password } = req.body;

      const existingUsername = await User.findOne({ username });

      if (existingUsername) {
        return res.status(400).json({ message: "Username is already taken" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = new User({ username, password: hashedPassword });

      await newUser.save();

      const token = jwt.sign({ user: { id: newUser._id, name: newUser.username } }, secret, {
        expiresIn: "12h"
      });

      return res.status(201).json({ username, token, id: newUser._id, message: "User registered successfully" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async login(req: Request, res: Response): Promise<Response> {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error("JWT_SECRET is not defined");
      }

      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      const token = jwt.sign(
        {
          user: {
            id: user._id,
            name: user.username
          }
        },
        secret,
        { expiresIn: "12h" }
      );
      return res.status(200).json({ token, username, id: user._id, image: user.image });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async updateUser(req: RequestWithUser, res: Response): Promise<Response> {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error("JWT_SECRET is not defined");
      }

      const { user } = req.body;

      if (!user) {
        return res.status(400).json({ message: "Required a User object" });
      }

      const name = req.userName;

      const target = await User.findOne({ username: name });
      if (user.username && target?.username) {
        target.username = user.username;
      }
      if (user.password && target?.password) {
        const hashedPwd = await bcrypt.hash(user.password, 10);
        target.password = hashedPwd;
      }
      if (typeof user.image !== "undefined" && target) {
        const uploadedImage = await cloudinary.uploader.upload(user.image, { folder: "userImages" });
        if (target.image) {
          await cloudinary.uploader.destroy(target.image.split("/").pop()?.split(".")[0] as string);
        }
        target.image = uploadedImage.secure_url;
      }
      const token = jwt.sign(
        {
          user: {
            id: target?._id,
            name: target?.username
          }
        },
        secret,
        { expiresIn: "12h" }
      );
      await target?.save();

      return res.status(200).json({ token, username: target?.username, image: target?.image, id: target?._id });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
