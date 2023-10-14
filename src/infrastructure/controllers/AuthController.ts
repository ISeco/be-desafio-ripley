import bcrypt from 'bcryptjs';
import awsCognito from "../services/cognito/awsCognito";
import express, { Request, Response, IRouter } from 'express';
import { IUserUseCase } from '../../domain/interfaces/use-cases/IUserUseCase';

import { StatusCodes } from "http-status-codes";

const {
  OK,
  CREATED,
  INTERNAL_SERVER_ERROR,
  BAD_REQUEST,
  NOT_FOUND,
} = StatusCodes;

class AuthController {
  private router: IRouter;
  private userUseCase: IUserUseCase;

  constructor( userUseCase: IUserUseCase ) {
    this.router = express.Router();
    this.userUseCase = userUseCase;
  }
  
  public registerUser() {
    this.router.post("/", async (req: Request, res: Response) => {
      try {
        const { name, email, password } = req.body;

        const salt = bcrypt.genSaltSync(12);
        const hashedPassword = bcrypt.hashSync(password, salt);
        const userCreated = await this.userUseCase.register(name, email, hashedPassword);
        if (!userCreated) return res.status(BAD_REQUEST).json({ message: 'User not created' });
        const user_id = userCreated.user_id;
        
        const userCognito = await awsCognito.adminCreateUser(email, password, user_id);
        if (userCognito.$response.data) await awsCognito.adminUpdatePassword(email, password);
        return res.status(CREATED).json({ message: 'User created successfully', data: userCreated });
      } catch (error: any) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });
      }
    });

    return this.router;
  }

  public loginUser() {
    this.router.get("/", async (req: Request, res: Response) => {
      try {
        const { email, password } = req.headers;
        
        const user = await this.userUseCase.login(email as string);
        const userCognito = await awsCognito.adminGetUser(email as string);
        
        if (!userCognito || !user) return res.status(NOT_FOUND).json({ message: 'User not found' });
        
        const user_password: string = user.password!;
        
        const validatePassword = bcrypt.compareSync(password as string, user_password);
        if (!validatePassword) return res.status(BAD_REQUEST).json({ message: 'Invalid credentials' });
        
        const token = await awsCognito.awsSignIn(email as string, password as string);
        const { AuthenticationResult } = token;

        return res.status(OK).json({ message: 'User logged in successfully', token: AuthenticationResult?.IdToken });       

      } catch (error: any) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });
      }
    });
    return this.router;
  }
}

export default AuthController;