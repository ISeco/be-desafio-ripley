import { IUserWhereBody } from "../IUserWhereBody";
import UserDTO from "../../../application/dtos/UserDTO";

export interface IUserUseCase {
  getUserBy: (whereBody: IUserWhereBody) => Promise<UserDTO>
}