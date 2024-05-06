import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { RequestWithUser } from "../types";

interface JwtPayload {
  user: {
    id: string;
    name: string;
  };
}

const verifyJWTOptional = (req: RequestWithUser, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    req.loggedin = false;
    return next();
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (decoded && (decoded as JwtPayload).user) {
      const decodedUser = decoded as JwtPayload;
      req.loggedin = true;
      req.userId = decodedUser.user.id;
      req.userName = decodedUser.user.name.toLowerCase();
    }
    next();
  });
};

export default verifyJWTOptional;
