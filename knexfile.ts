import type { Knex } from "knex";

import dotenv from "dotenv";

dotenv.config();

const {
  MYSQL_HOST,
  MYSQL_PORT,
  MYSQL_DATABASE,
  MYSQL_USER,
  MYSQL_PASSWORD
} = process.env;

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "mysql2",
    connection: {
      host: MYSQL_HOST,
      port: parseInt(MYSQL_PORT as string || "3306"),
      database: MYSQL_DATABASE,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
    },
    migrations: {
      directory: "./src/infrastructure/database/migrations",
      extension: "ts",
      schemaName: MYSQL_DATABASE,

    },
    seeds: {
      directory: "./src/infrastructure/database/seeds",
      extension: "ts",
    },
    pool: { min: 0, max: 30, idleTimeoutMillis: 60 * 1000 },
  },
  production: {
    client: "mysql2",
    connection: {
      host: MYSQL_HOST,
      port: parseInt(MYSQL_PORT as string || "3306"),
      database: MYSQL_DATABASE,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
    },
    migrations: {
      directory: `${__dirname}/dist/src/infrastructure/database/migrations`,
      extension: "js",
      schemaName: MYSQL_DATABASE,
      loadExtensions: [".js"],
    },
    seeds: {
      directory: `${__dirname}/dist/src/infrastructure/database/seeds`,
      extension: "js",
      loadExtensions: [".js"],
    },
    pool: { min: 0, max: 30, idleTimeoutMillis: 60 * 1000 },
  },
};

export default config;