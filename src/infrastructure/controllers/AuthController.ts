import bcrypt from 'bcryptjs';
import awsCognito from "../services/cognito/awsCognito";
import express, { Request, Response, IRouter } from 'express';
import { IAuthUseCase } from '../../domain/interfaces/use-cases/IAuthUseCase';
import { IUserUseCase } from '../../domain/interfaces/use-cases/IUserUseCase';

import { StatusCodes } from "http-status-codes";

const {
  OK,
  CREATED,
  BAD_REQUEST,
  NOT_FOUND,
} = StatusCodes;

class AuthController {
  private router: IRouter;
  private authUseCase: IAuthUseCase;
  private userUseCase: IUserUseCase;

  constructor( authUseCase: IAuthUseCase, userUseCase: IUserUseCase ) {
    this.router = express.Router();
    this.authUseCase = authUseCase;
    this.userUseCase = userUseCase;
  }
  
  public registerUser() {
    this.router.post("/", async (req: Request, res: Response) => {
      try {
        const { name, email, password } = req.body;

        const salt = bcrypt.genSaltSync(12);
        const hashedPassword = bcrypt.hashSync(password, salt);
        const userCreated = await this.authUseCase.register(name, email, hashedPassword);
        if (!userCreated) return res.status(BAD_REQUEST).json({ message: 'User not created' });
        const user_id = userCreated.user_id;
        
        const userCognito = await awsCognito.adminCreateUser(email, password, user_id);
        if (userCognito.$response.data) await awsCognito.adminUpdatePassword(email, password);
        return res.status(CREATED).json({ message: 'User created successfully', data: userCreated });
      } catch (error: any) {
        return res.status(error.code).json({ message: error.message });
      }
    });

    return this.router;
  }

  public loginUser() {
    this.router.get("/", async (req: Request, res: Response) => {
      try {
        const { email, password } = req.headers;
        
        const user = await this.authUseCase.login(email as string);
        const userCognito = await awsCognito.adminGetUser(email as string);
        
        if (!userCognito || !user) return res.status(NOT_FOUND).json({ message: 'User not found' });
        
        const user_password: string = user.password!;
        
        const validatePassword = bcrypt.compareSync(password as string, user_password);
        if (!validatePassword) return res.status(BAD_REQUEST).json({ message: 'Invalid credentials' });
        
        const token = await awsCognito.awsSignIn(email as string, password as string);
        const { AuthenticationResult } = token;
        const userResponse = {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
        }

        return res.status(OK).json({
          message: 'User logged in successfully',
          user: userResponse,
          token: AuthenticationResult?.IdToken,
        });       

      } catch (error: any) {
        return res.status(error.code).json({ message: error.message });
      }
    });
    return this.router;
  }

  public validateToken() {
    this.router.get("/validate", async (req: Request, res: Response) => {
      try {
        const { token } = req.headers;
        const validateToken = await awsCognito.verifyJWTToken(token as string);
        const { exp } = validateToken;
        const currentDate = new Date();
        const dateNow = currentDate.getTime() / 1000;
        if (dateNow > exp) return res.status(BAD_REQUEST).json({ message: 'Token expired', ok: false });
  
        const user = await this.userUseCase.getUserBy({ is_active: true, email: validateToken.email as string });
        const userResponse = {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
        }
        
        return res.status(OK).json({
          message: 'Token validated successfully',
          user: userResponse,
          token
        });
      } catch (error: any) {
        return res.status(BAD_REQUEST).json({ message: 'Invalid token', ok: false });
      }
    });
    return this.router;
  }
}

export default AuthController;