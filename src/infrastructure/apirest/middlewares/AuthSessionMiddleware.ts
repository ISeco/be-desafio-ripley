import { StatusCodes } from "http-status-codes";
import { NextFunction, Response } from "express";

import awsCognito from "../../services/cognito/awsCognito";
import IRequest from "../../../domain/interfaces/request/IRequest";

const { UNAUTHORIZED, BAD_REQUEST } = StatusCodes;

const AuthSessionMiddleware = async (req: IRequest, res: Response, next: NextFunction) => {
  try {
    const { token } = req.headers;
    if (!token) return res.status(BAD_REQUEST).json({ message: 'Missing token' });

    const validateToken = await awsCognito.verifyJWTToken(token as string);
    if (!validateToken) return res.status(UNAUTHORIZED).json({ message: 'Invalid token' });

    req.payload = {
      ...req.payload,
      user_id: validateToken["custom:user_id"] as string,
      email: validateToken["cognito:username"] as string,
      iat: validateToken.iat,
      exp: validateToken.exp,
    };
    next();
  } catch (error: any) {
    return res.status(UNAUTHORIZED).json({ message: "Invalid Token" });
  }
}

export default AuthSessionMiddleware;