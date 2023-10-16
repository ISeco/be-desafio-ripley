import express from "express";

// Repositories
import UserRepository from "../../../repositories/MySQLUserRepository";
// Use cases
import AuthUseCase from "../../../../application/use-cases/user/AuthUseCase";
import UserUseCase from "../../../../application/use-cases/user/UserUseCase";
// Controllers
import AuthController from "../../../controllers/AuthController";
// Middlewares
import LoginUserMiddleware from "../../middlewares/express-validations/user/LoginUserMiddleware";
import RegisterUserMiddleware from "../../middlewares/express-validations/user/RegisterUserMiddleware";

const router = express.Router();

const userRepository = new UserRepository();
const authUseCase = new AuthUseCase(userRepository);
const userUseCase = new UserUseCase(userRepository);
const authController = new AuthController(authUseCase, userUseCase);

router.use('/register', RegisterUserMiddleware, authController.registerUser());
router.use('/login', LoginUserMiddleware, authController.loginUser());
router.use(authController.validateToken());

export default router;
