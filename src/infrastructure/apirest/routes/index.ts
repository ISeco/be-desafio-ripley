import express from "express";
import userRoutes from "./auth/auth-routes";

const router = express.Router();

router.use('/auth', userRoutes);

export default router;