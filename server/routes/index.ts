import express from "express";
import { MediaController } from "../controllers/MediaController";
import { UserController } from "../controllers/UserController";
import verifyJWT from "../middlewares/verifyJWT";
import verifyJWTOptional from "../middlewares/verifyJWTOptional";

const router = express.Router();
const mediaController = new MediaController();
const userController = new UserController();

// Media routes
router.post("/upload", verifyJWT, mediaController.uploadMedia);
router.get("/images", verifyJWTOptional, mediaController.listMedia);
router.put("/images/:id/react", verifyJWT, mediaController.reactMedia);
router.delete("/images/:id/delete", verifyJWT, mediaController.deleteMedia);

// User routes
router.post("/register", userController.register);
router.post("/login", userController.login);
router.put("/update", verifyJWT, userController.updateUser);

export default router;
