import { StatusCodes } from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { header, validationResult, FieldValidationError } from "express-validator";

const { BAD_REQUEST } = StatusCodes;

const HEADER_STRING_VALIDATION = (key: string) => 
  header(key)
    .notEmpty()
    .withMessage(`${key} is required`)
    .isString()
    .withMessage(`${key} must be a string`);

const EMAIL_VALIDATION = (key: string) =>
  header(key)
    .notEmpty()
    .withMessage(`${key} is required`)
    .isEmail()
    .withMessage(`${key} must be an email`);

const LoginUserMiddleware = [
  HEADER_STRING_VALIDATION('email'),
  EMAIL_VALIDATION('email'),
  HEADER_STRING_VALIDATION('password'),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      validationResult(req).throw();
      return next();
    } catch (error: any) {
      const errors: FieldValidationError = error.errors[0];
      return res.status(BAD_REQUEST).json({ message: errors });
    }
  }
];

export default LoginUserMiddleware;