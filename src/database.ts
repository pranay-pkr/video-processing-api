import { Sequelize } from "sequelize";

// Initialize Sequelize with SQLite database
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite3",
  logging: false,
});

export default sequelize;
