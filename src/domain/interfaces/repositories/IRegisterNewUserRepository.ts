import User from "../../entities/User";

interface IRegisterNewUserRepository {
  registerNewUser: (name: string, email: string, password: string) => Promise<User>;
  loginUser: (email: string) => Promise<User>
}

export default IRegisterNewUserRepository;