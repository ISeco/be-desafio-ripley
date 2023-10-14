import { IUserUseCase } from "../../../domain/interfaces/use-cases/IUserUseCase";
import IRegisterNewUserRepository from "../../../domain/interfaces/repositories/IRegisterNewUserRepository";

class UserUseCase implements IUserUseCase {
  private userRepository: IRegisterNewUserRepository;

  constructor(userRepository: IRegisterNewUserRepository) {
    this.userRepository = userRepository;
  }

  public async register( name: string, email: string, password: string) {
    try {
      const createdUser = await this.userRepository.registerNewUser(
        name,
        email,
        password
      );
      return {
        user_id: createdUser.getId(),
        name: createdUser.getName(),
        email: createdUser.getEmail(),
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async login(email: string) {
    try {
      const getUserCredemtials = await this.userRepository.loginUser(email);
      return {
        user_id: getUserCredemtials.getId(),
        email: getUserCredemtials.getEmail(),
        password: getUserCredemtials.getPassword(),
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  
}

export default UserUseCase;
