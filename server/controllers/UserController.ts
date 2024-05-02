import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import jwt from "jsonwebtoken";

export class UserController {
  public async register(req: Request, res: Response): Promise<Response> {
    try {
      const { username, password } = req.body;

      const existingUsername = await User.findOne({ username });

      if (existingUsername) {
        return res.status(400).json({ message: "Username is already taken" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = new User({ username, password: hashedPassword });

      await newUser.save();

      const token = jwt.sign({ userId: newUser._id }, "secretKey", { expiresIn: "12h" });

      return res.status(201).json({ username, token, message: "User registered successfully" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async login(req: Request, res: Response): Promise<Response> {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      const token = jwt.sign({ userId: user._id }, "secretKey", { expiresIn: "12h" });
      return res.status(200).json({ token, username });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
