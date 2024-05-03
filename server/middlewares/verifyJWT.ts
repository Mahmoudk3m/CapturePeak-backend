import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface RequestWithUser extends Request {
  userId?: string;
  userEmail?: string;
  userHashedPwd?: string;
}

interface JwtPayload {
  user: {
    id: string;
    email: string;
    password: string;
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
      req.userEmail = decodedUser.user.email;
      req.userHashedPwd = decodedUser.user.password;
    }
    next();
  });
};

export default verifyJWT;
