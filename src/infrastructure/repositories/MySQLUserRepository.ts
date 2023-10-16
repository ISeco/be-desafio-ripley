import { Knex } from "knex";
import knex from '../database/database-config';

import User from "../../domain/entities/User";
import IRegisterNewUserRepository from "../../domain/interfaces/repositories/IRegisterNewUserRepository";

import ErrorType from "../error/errorTypes";
import ErrorException from "../../domain/error-exception/ErrorException";
import { IUserWhereBody } from "../../domain/interfaces/IUserWhereBody";

const USER_TABLE = 'user';

class MySQLRegisterNewUserRepository implements IRegisterNewUserRepository {
  private knex: Knex;

  constructor() {
    this.knex = knex;
  }

  public async registerNewUser(name: string, email: string, password: string): Promise<User> {
    try {
      const response = await this.knex(USER_TABLE).insert({ name, email, password });
      if (response.length === 0) throw new ErrorException(404, ErrorType.User.ERROR_USER_NOT_FOUND);
      const getUserCreated = await this.knex(USER_TABLE).where({ email }).first();
      return this.toUserModel(getUserCreated);
    } catch (error: any) {
      const customInstance = error instanceof ErrorException;
      const message = customInstance ? error.message : ErrorType.User.ERROR_USER_INSERTING_RECORD;
      const status = customInstance ? error.code : 500;
      throw new ErrorException(status, message);
    }
  }

  public async loginUser(email: string): Promise<User> {
    try {
      const response = await this.knex(USER_TABLE).where({ email, is_active: true }).first();
      if (response.length === 0) throw new ErrorException(404, ErrorType.User.ERROR_USER_NOT_FOUND);
      return this.toUserModel(response);
    } catch (error: any) {
      const customInstance = error instanceof ErrorException;
      const message = customInstance ? error.message : ErrorType.User.ERROR_GETTING_USER;
      const status = customInstance ? error.code : 500;
      throw new ErrorException(status, message);
    }
  }

  public async getUserBy(whereBody: IUserWhereBody): Promise<User> {
    try {
      const response = await this.knex(USER_TABLE).where(whereBody).first();
      if (response.length === 0) throw new ErrorException(404, ErrorType.User.ERROR_USER_NOT_FOUND);
      return this.toUserModel(response);
    } catch (error: any) {
      console.log(error);
      const customInstance = error instanceof ErrorException;
      const message = customInstance ? error.message : ErrorType.User.ERROR_GETTING_USER;
      const status = customInstance ? error.code : 500;
      throw new ErrorException(status, message);
    }
  }

  private toUserModel(userRaw: any): User {
    return new User(userRaw.user_id, userRaw.name, userRaw.email, userRaw.password);
  }
}

export default MySQLRegisterNewUserRepository;