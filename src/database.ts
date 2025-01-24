import { Sequelize } from "sequelize";

// Initialize Sequelize with SQLite database
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage:
    process.env.NODE_ENV === "test"
      ? "./database.test.sqlite3"
      : "./database.sqlite3",
  logging: false,
});

export default sequelize;
