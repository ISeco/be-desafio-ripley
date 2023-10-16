import UserDTO from "../../../application/dtos/UserDTO";

export interface IAuthUseCase {
  register: (name: string, email: string, password: string) => Promise<UserDTO>
  login: (email: string) => Promise<UserDTO>
}