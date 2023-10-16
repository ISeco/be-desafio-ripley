import { IAuthUseCase } from "../../../domain/interfaces/use-cases/IAuthUseCase";
import IRegisterNewUserRepository from "../../../domain/interfaces/repositories/IRegisterNewUserRepository";

import ErrorException from "../../../domain/error-exception/ErrorException";

class AuthUseCase implements IAuthUseCase {
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
      throw new ErrorException(error.code, error.message);
    }
  }

  public async login(email: string) {
    try {
      const getUserCredemtials = await this.userRepository.loginUser(email);
      return {
        user_id: getUserCredemtials.getId(),
        email: getUserCredemtials.getEmail(),
        name: getUserCredemtials.getName(),
        password: getUserCredemtials.getPassword(),
      };
    } catch (error: any) {
      throw new ErrorException(error.code, error.message);
    }
  }  
}

export default AuthUseCase;
