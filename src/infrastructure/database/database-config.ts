import Knex from "knex";
import dotenv from 'dotenv';

import KnexConfig from '../../../knexfile'

dotenv.config();

const { NODE_ENV } = process.env;

const config = KnexConfig[NODE_ENV || 'development'];

const knex = Knex(config);

export default knex;
