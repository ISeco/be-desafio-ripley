import { StatusCodes } from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { header, validationResult, FieldValidationError } from "express-validator";

const { BAD_REQUEST } = StatusCodes;

const TOKEN_HEADER_VALIDATION = (key: string) => 
  header(key)
    .notEmpty()
    .withMessage(`${key} is required`)
    .isString()
    .withMessage(`${key} must be a string`);

const ValidateTokenHeadersMiddleware = [
  TOKEN_HEADER_VALIDATION('token'),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      validationResult(req).throw();
      return next();
    } catch (error: any) {
      const errors: FieldValidationError[] = error.errors[0];
      return res.status(BAD_REQUEST).json({ message: errors });
    }
  }
];

export default ValidateTokenHeadersMiddleware;