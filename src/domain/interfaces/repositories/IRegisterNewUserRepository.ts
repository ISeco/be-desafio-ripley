import User from "../../entities/User";
import { IUserWhereBody } from "../IUserWhereBody";

interface IRegisterNewUserRepository {
  registerNewUser: (name: string, email: string, password: string) => Promise<User>;
  loginUser: (email: string) => Promise<User>
  getUserBy: (whereBody: IUserWhereBody) => Promise<User>
}

export default IRegisterNewUserRepository;