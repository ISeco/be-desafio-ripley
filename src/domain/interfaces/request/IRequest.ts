import { Request } from "express";

interface IRequest extends Request {
  payload: {
    user_id: string;
    email: string;
    iat: number;
    exp: number;
  }
}

export default IRequest;