import { DataTypes, Model } from "sequelize";
import db from "../database/connection.js";

class Usuario extends Model {}

Usuario.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    partidas_jugadas: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    partidas_ganadas: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    sequelize: db,
    modelName: "Usuario",
    tableName: "usuarios",
    timestamps: false
});

export default Usuario;