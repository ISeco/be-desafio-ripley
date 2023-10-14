import { Knex } from "knex";
import knex from '../database/database-config';

import User from "../../domain/entities/User";
import IRegisterNewUserRepository from "../../domain/interfaces/repositories/IRegisterNewUserRepository";

const USER_TABLE = 'user';

class MySQLRegisterNewUserRepository implements IRegisterNewUserRepository {
  private knex: Knex;

  constructor() {
    this.knex = knex;
  }

  public async registerNewUser(name: string, email: string, password: string): Promise<User> {
    try {
      const response = await this.knex(USER_TABLE).insert({ name, email, password });
      if (response.length === 0) throw new Error('User not created');
      const getUserCreated = await this.knex(USER_TABLE).where({ email }).first();
      return this.toUserModel(getUserCreated);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async loginUser(email: string): Promise<User> {
    try {
      const response = await this.knex(USER_TABLE).where({ email, is_active: true }).first();
      if (response.length === 0) throw new Error('User not found');
      return this.toUserModel(response);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  private toUserModel(userRaw: any): User {
    return new User(userRaw.user_id, userRaw.name, userRaw.email, userRaw.password);
  }
}

export default MySQLRegisterNewUserRepository;