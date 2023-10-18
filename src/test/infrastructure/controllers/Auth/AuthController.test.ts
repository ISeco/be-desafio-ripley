import request from "supertest";
import express, { Express } from "express";
import bcrypt from "bcryptjs";

import AuthUseCase from "../../../../application/use-cases/user/AuthUseCase";
import UserUseCase from "../../../../application/use-cases/user/UserUseCase";

import User from "../../../../domain/entities/User";
import ErrorException from "../../../../domain/error-exception/ErrorException";
import IRegisterNewUserRepository from "../../../../domain/interfaces/repositories/IRegisterNewUserRepository";
import { IAuthUseCase } from "../../../../domain/interfaces/use-cases/IAuthUseCase";
import { IUserUseCase } from "../../../../domain/interfaces/use-cases/IUserUseCase";

import AuthController from "../../../../infrastructure/controllers/AuthController";

import LoginUserMiddleware from "../../../../infrastructure/apirest/middlewares/express-validations/user/LoginUserMiddleware";
import RegisterUserMiddleware from "../../../../infrastructure/apirest/middlewares/express-validations/user/RegisterUserMiddleware";
import ValidateTokenHeadersMiddleware from "../../../../infrastructure/apirest/middlewares/express-validations/user/ValidateTokenHeadersMiddleware";

import awsCognito, { verifierToken } from "../../../../infrastructure/services/cognito/awsCognito";
import {
  AdminCreateUserResponse,
  AdminConfirmSignUpResponse,
  InitiateAuthResponse,
  AdminGetUserResponse,
} from "aws-sdk/clients/cognitoidentityserviceprovider";
import { PromiseResult } from "aws-sdk/lib/request";
import { AWSError } from "aws-sdk";
import { CognitoIdTokenPayload } from "aws-jwt-verify/jwt-model";

jest.mock("../../../../infrastructure/services/cognito/awsCognito");

class MockRegisterNewUserRepository implements IRegisterNewUserRepository {
  registerNewUser(): Promise<User> {
    throw new ErrorException(500, "Method not implemented.");
  }
  loginUser(): Promise<User> {
    throw new ErrorException(500, "Method not implemented.");
  }
  getUserBy(): Promise<User> {
    throw new ErrorException(500, "Method not implemented.");
  }
}

const cognitoCreateUser: PromiseResult<AdminCreateUserResponse, AWSError> = {
  $response: {
    data: {
      User: {
        Username: "john.doe@gmail.com",
        Attributes: [
          {
            Name: "email_verified",
            Value: "true",
          },
          {
            Name: "email",
            Value: "john.doe@gmail.com",
          },
          {
            Name: "name",
            Value: "John Doe",
          },
          {
            Name: "sub",
            Value: "e3b0c442-5fbb-4bce-80e0-000000000000",
          },
        ],
        UserStatus: "CONFIRMED",
        Enabled: true,
        UserCreateDate: new Date(),
        UserLastModifiedDate: new Date(),
      },
    },
    error: void 0,
    hasNextPage: () => false,
    nextPage: () => null,
    requestId: "00000000-0000-0000-0000-000000000000",
    retryCount: 0,
    redirectCount: 0,
    httpResponse: {
      body: "",
      headers: {},
      statusCode: 200,
      statusMessage: "OK",
      streaming: false,
      createUnbufferedStream: () => ({}),
    },
  },
};

const cognitoGetUser: AdminGetUserResponse = {
  Username: "john.doe@gmail.com",
  UserStatus: "CONFIRMED",
  Enabled: true,
  UserCreateDate: new Date(),
  UserLastModifiedDate: new Date(),
};

const adminConfirmSignUpResponse: PromiseResult<
  AdminConfirmSignUpResponse,
  AWSError
> = {
  $response: {
    data: {},
    error: void 0,
    hasNextPage: () => false,
    nextPage: () => null,
    requestId: "00000000-0000-0000-0000-000000000000",
    retryCount: 0,
    redirectCount: 0,
    httpResponse: {
      body: "",
      headers: {},
      statusCode: 200,
      statusMessage: "OK",
      streaming: false,
      createUnbufferedStream: () => ({}),
    },
  },
};

const validTokenResult: CognitoIdTokenPayload = {
  auth_time: 1627777777,
  exp: 1627777777,
  aud: "client_id",
  iat: 1627777777,
  iss: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_123456789",
  sub: "e3b0c442-5fbb-4bce-80e0-000000000000",
  token_use: "id",
  "cognito:preferred_role": "arn:aws:iam::123456789:role/role_name",
  "cognito:roles": ["arn:aws:iam::123456789:role/role_name"],
  "cognito:username": "john.doe@gmail.com",
  at_hash: "hash",
  email_verified: true,
  identities: [],
  jti: "jti",
  origin_jti: "origin_jti",
  phone_number_verified: true,
  "cognito:groups": ["group_name"],
};

describe("AuthController", () => {
  let mockserver: Express;
  let mockUserRepository: MockRegisterNewUserRepository;
  let authUseCase: IAuthUseCase;
  let userUseCase: IUserUseCase;
  let authController: AuthController;

  beforeAll(() => {
    mockUserRepository = new MockRegisterNewUserRepository();
    authUseCase = new AuthUseCase(mockUserRepository);
    userUseCase = new UserUseCase(mockUserRepository);
    authController = new AuthController(authUseCase, userUseCase);

    mockserver = express();
    mockserver.use(express.json());
    mockserver.use(
      "/auth/register",
      RegisterUserMiddleware,
      authController.registerUser()
    );
    mockserver.use(
      "/auth/login",
      LoginUserMiddleware,
      authController.loginUser()
    );
    mockserver.use(
      "/auth",
      ValidateTokenHeadersMiddleware,
      authController.validateToken()
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should return 201 when register a new user", async () => {
      const salt = bcrypt.genSaltSync(12);
      const hashedPassword = bcrypt.hashSync("Test123#", salt);
      const user = new User(
        1,
        "John Doe",
        "john.doe@gmail.com",
        hashedPassword
      );
      const signUpSpy = jest
        .spyOn(awsCognito, "adminCreateUser")
        .mockResolvedValueOnce(cognitoCreateUser);
      jest
        .spyOn(mockUserRepository, "registerNewUser")
        .mockResolvedValueOnce(user);
      jest
        .spyOn(awsCognito, "adminConfirmSignUp")
        .mockResolvedValueOnce(adminConfirmSignUpResponse);

      const validData = {
        name: "John Doe",
        email: "john.doe@gmail.com",
        password: "Test123#",
      };

      const userCreated = {
        user_id: user.getId(),
        name: user.getName(),
        email: user.getEmail(),
      };

      const response = await request(mockserver)
        .post("/auth/register")
        .send(validData)
        .set("Accept", "application/json");

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: "User created successfully",
        data: userCreated,
      });
      expect(signUpSpy).toHaveBeenCalledWith(
        validData.email,
        validData.password,
        user.getId()
      );
    });

    it("should return 400 when register a new user without password", async () => {
      const invalidData = {
        name: "John Doe",
        email: "john.doe@gmail.com",
      };
      const response = await request(mockserver)
        .post("/auth/register")
        .send(invalidData)
        .set("Accept", "application/json");

      expect(response.status).toBe(400);
    });

    it("should return 400 when register a new user with bad password policies", async () => {
      const invalidData = {
        name: "John Doe",
        email: "john.doe@gmail.com",
        password: "Test123",
      };
      const response = await request(mockserver)
        .post("/auth/register")
        .send(invalidData)
        .set("Accept", "application/json");

      expect(response.status).toBe(400);
    });
  });

  describe("loginUser", () => {
    it("should return 200 when login with valid credentials", async () => {
      const hashedPassword = bcrypt.hashSync("Test123#", 12);
      const user = new User(
        1,
        "John Doe",
        "john.doe@gmail.com",
        hashedPassword
      );

      const signInResponse: InitiateAuthResponse = {
        Session: "session",
        ChallengeName: "challenge",
        AuthenticationResult: {
          AccessToken: "access_token",
          ExpiresIn: 3600,
          IdToken: "id_token",
          RefreshToken: "refresh_token",
          TokenType: "token_type",
        },
      };

      const loginUserSpy = jest
        .spyOn(mockUserRepository, "loginUser")
        .mockResolvedValueOnce(user);
      const adminGetUser = jest
        .spyOn(awsCognito, "adminGetUser")
        .mockResolvedValueOnce(cognitoGetUser);

      const signInSpy = jest
        .spyOn(awsCognito, "awsSignIn")
        .mockResolvedValueOnce(signInResponse);

      const validData = {
        email: "john.doe@gmail.com",
        password: "Test123#",
      };
      const response = await request(mockserver)
        .get("/auth/login")
        .set("email", validData.email)
        .set("password", validData.password)
        .set("Accept", "application/json");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "User logged in successfully",
        user: {
          user_id: user.getId(),
          name: user.getName(),
          email: user.getEmail(),
        },
        token: "id_token",
      });
      expect(adminGetUser).toHaveBeenCalledWith(validData.email);
      expect(signInSpy).toHaveBeenCalledWith(
        validData.email,
        validData.password
      );
      expect(loginUserSpy).toHaveBeenCalledWith(validData.email);
    });

    it("should return 401 when login with invalid credentials", async () => {
      const hashedPassword = bcrypt.hashSync("Test123#", 12);
      const user = new User(
        1,
        "John Doe",
        "john.doe@gmail.com",
        hashedPassword
      );
      const loginUserSpy = jest.spyOn(mockUserRepository, "loginUser").mockResolvedValueOnce(user);
      const adminGetUser = jest.spyOn(awsCognito, "adminGetUser").mockResolvedValueOnce(cognitoGetUser);

      const invalidData = {
        email: "john.doe@gmail.com",
        password: "Testing123#",
      };
      const response = await request(mockserver)
        .get("/auth/login")
        .set("email", invalidData.email)
        .set("password", invalidData.password)
        .set("Accept", "application/json");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Invalid credentials",
      });
      expect(adminGetUser).toHaveBeenCalledWith(invalidData.email);
      expect(loginUserSpy).toHaveBeenCalledWith(invalidData.email);
    });
  });

  describe("validateToken", () => {
    it("should return 400 when validate an invalid token", async () => {
      const validateTokenSpy = jest.spyOn(awsCognito, "verifyJWTToken").mockRejectedValueOnce(new ErrorException(400, "Invalid token"));

      const response = await request(mockserver)
        .get("/auth/validate")
        .set("token", "invalid_token")
        .set("Accept", "application/json");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Invalid token",
        ok: false,
      });
      expect(validateTokenSpy).toHaveBeenCalledWith("invalid_token");
    });
  });
});
