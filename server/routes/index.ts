import express from "express";
import { UserController } from "../controllers/UserController";

const router = express.Router();
const userController = new UserController();

// User routes
router.post("/register", userController.register);
router.post("/login", userController.login);

export default router;
