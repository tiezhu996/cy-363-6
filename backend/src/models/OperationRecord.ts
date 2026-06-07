import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export interface OperationRecordAttributes {
  id?: number;
  module_name: string;
  owner_name: string;
  status: string;
  metric: string;
  priority: string;
  deadline?: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

export class OperationRecord extends Model<OperationRecordAttributes> {
  public id!: number;
  public module_name!: string;
  public owner_name!: string;
  public status!: string;
  public metric!: string;
  public priority!: string;
  public deadline!: Date | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

OperationRecord.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    module_name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    owner_name: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    metric: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    priority: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "中",
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "operation_records",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);
