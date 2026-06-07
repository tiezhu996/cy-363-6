import { Sequelize } from "sequelize";
import { env } from "./env";

export const sequelize = new Sequelize(
  env.dbName,
  env.dbUser,
  env.dbPassword,
  {
    host: env.dbHost,
    port: env.dbPort,
    dialect: "mysql",
    logging: false,
    timezone: "+08:00",
  }
);

export async function connectDatabase() {
  try {
    await sequelize.authenticate();
    console.log("[Database] Connection established successfully");
  } catch (error) {
    console.error("[Database] Unable to connect:", error);
    throw error;
  }
}
