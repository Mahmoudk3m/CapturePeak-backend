import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { RequestWithUser } from "../types";

interface JwtPayload {
  user: {
    id: string;
    name: string;
  };
}

const verifyJWT = (req: RequestWithUser, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    return res.status(401).json({ message: "Unauthorized - No token provided" });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (decoded && (decoded as JwtPayload).user) {
      const decodedUser = decoded as JwtPayload;
      req.userId = decodedUser.user.id;
      req.userName = decodedUser.user.name.toLowerCase();
    }
    next();
  });
};

export default verifyJWT;
