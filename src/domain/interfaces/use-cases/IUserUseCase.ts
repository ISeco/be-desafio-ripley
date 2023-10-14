import UserDTO from "../../../application/dtos/UserDTO";

export interface IUserUseCase {
  register: (name: string, email: string, password: string) => Promise<UserDTO>
  login: (email: string) => Promise<UserDTO>
}