import { StatusCodes } from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { body, validationResult, FieldValidationError } from "express-validator";

const { BAD_REQUEST } = StatusCodes;
const regex: RegExp = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;

const BODY_STRING_VALIDATION = (key: string) => 
  body(key)
    .notEmpty()
    .withMessage(`${key} is required`)
    .isString()
    .withMessage(`${key} must be a string`);

const EMAIL_VALIDATION = (key: string) =>
  body(key)
    .notEmpty()
    .withMessage(`${key} is required`)
    .isEmail()
    .withMessage(`${key} must be an email`);

const CUSTOM_VALIDATE_PASSWORD = (key: string) =>
  body(key)
    .notEmpty()
    .withMessage(`${key} is required`)
    .isString()
    .withMessage(`${key} must be a string`)
    .custom((value: string) => {
      return regex.test(value);
    })
    .withMessage(`${key} must respect security policies`);

const RegisterUserMiddleware = [
  BODY_STRING_VALIDATION('name'),
  BODY_STRING_VALIDATION('email'),
  EMAIL_VALIDATION('email'),
  BODY_STRING_VALIDATION('password'),
  CUSTOM_VALIDATE_PASSWORD('password'),
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

export default RegisterUserMiddleware;