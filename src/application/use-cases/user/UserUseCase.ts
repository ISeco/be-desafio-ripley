import { IUserUseCase } from "../../../domain/interfaces/use-cases/IUserUseCase";
import IRegisterNewUserRepository from "../../../domain/interfaces/repositories/IRegisterNewUserRepository";

import ErrorException from "../../../domain/error-exception/ErrorException";
import { IUserWhereBody } from "../../../domain/interfaces/IUserWhereBody";

class UserUseCase implements IUserUseCase {
  private userRepository: IRegisterNewUserRepository;

  constructor(userRepository: IRegisterNewUserRepository) {
    this.userRepository = userRepository;
  }

  public async getUserBy(whereBody: IUserWhereBody) {
    try {
      const createdUser = await this.userRepository.getUserBy(whereBody);
      return {
        user_id: createdUser.getId(),
        name: createdUser.getName(),
        email: createdUser.getEmail(),
      }
    } catch (error: any) {
      throw new ErrorException(error.code, error.message);
    }
  }
}

export default UserUseCase;
