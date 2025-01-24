import { DataTypes, Model } from "sequelize";
import sequelize from "../database";

class Video extends Model {
  declare id: number;
  declare filename: string;
  declare path: string;
  declare size: number;
  declare duration: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Video.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "videos",
    timestamps: true,
  }
);

export default Video;
