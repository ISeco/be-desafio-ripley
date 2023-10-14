import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return await knex.schema
    .createTable("user", (table) => {
      table.increments("user_id").primary();
      table.string("name", 255).notNullable();
      table.string("email", 255).notNullable();
      table.string("password", 255).notNullable();
      table.boolean("is_active").defaultTo(true);

      table.unique(["email"]);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("user");
}
