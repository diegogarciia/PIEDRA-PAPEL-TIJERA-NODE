import { DataTypes, Model } from "sequelize";
import db from "../database/connection.js";

class Partida extends Model {}

Partida.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_jugador1: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_jugador2: {
        type: DataTypes.INTEGER,
        allowNull: true 
    },
    estado: {
        type: DataTypes.ENUM('pendiente', 'jugando', 'finalizada'),
        defaultValue: 'pendiente'
    },
    victorias_j1: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    victorias_j2: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    jugada_j1: {
        type: DataTypes.STRING,
        allowNull: true
    },
    jugada_j2: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ganador_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    sequelize: db,
    modelName: "Partida",
    tableName: "partidas",
    timestamps: true 
});

export default Partida;