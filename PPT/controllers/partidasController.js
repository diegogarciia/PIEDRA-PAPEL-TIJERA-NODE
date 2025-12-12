import { response, request } from 'express';
import { Op } from 'sequelize';
import { Partida } from '../models/index.js';

const crearPartida = async(req = request, res = response) => {
    const { id_usuario, contra_maquina } = req.body; 

    try {
        const partidaActiva = await Partida.findOne({
            where: {
                [Op.or]: [
                    { id_jugador1: id_usuario },
                    { id_jugador2: id_usuario }
                ],
                estado: {
                    [Op.ne]: 'finalizada'
                }
            }
        });

        if ( partidaActiva ) {
            return res.status(400).json({
                msg: 'Ya tienes una partida en curso (ID: ' + partidaActiva.id + '), debes terminarla antes de crear otra.'
            });
        }

        const nuevaPartida = await Partida.create({
            id_jugador1: id_usuario,
            estado: 'pendiente' 
        });

        res.json({
            msg: 'Partida creada correctamente',
            partida: nuevaPartida
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Hable con el administrador' });
    }
}

export { crearPartida }