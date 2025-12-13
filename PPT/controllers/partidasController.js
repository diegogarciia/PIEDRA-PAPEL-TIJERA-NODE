import { response, request } from 'express';
import { Op } from 'sequelize';
import { Partida } from '../models/index.js';
import { Usuario } from '../models/index.js';

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

        let id_rival = null;
        let estadoPartida = 'pendiente';

        if ( contra_maquina === true ) {
            id_rival = 100;            
            estadoPartida = 'jugando'; 
        }

        const nuevaPartida = await Partida.create({
            id_jugador1: id_usuario,
            id_jugador2: id_rival,     
            estado: estadoPartida     
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

const hacerJugada = async (req = request, res = response) => {
    const { id_partida, id_usuario, jugada } = req.body;

    const partida = await Partida.findOne({
        where: { id: id_partida }
    });

    if ( !partida ) {
        return res.status(404).json({
            msg: 'No existe esa partida con el id ' + id_partida
        });
    }

    if (partida.estado === 'finalizada') {
        return res.status(400).json({
            msg: '¡Esta partida ya ha terminado! No se admiten más jugadas. 🚫',
            partida
        });
    }

    if ( id_usuario !== partida.id_jugador1 && id_usuario !== partida.id_jugador2 ) {
        return res.status(401).json({
            msg: 'No tienes permiso para jugar en esta partida'
        });
    }

    let campoJugada = '';
    if ( id_usuario === partida.id_jugador1 ) {
        campoJugada = 'jugada_j1';
    } else {
        campoJugada = 'jugada_j2'; 
    }

    partida[campoJugada] = jugada;
    await partida.save(); 

    if ( partida.id_jugador2 === 100 ) {
        
        const opciones = ['piedra', 'papel', 'tijera'];
        const randomIndice = Math.floor(Math.random() * 3); 
        const jugadaRival = opciones[randomIndice];
            
        partida.jugada_j2 = jugadaRival;

        let ganadorRonda = null;
        
        if ( jugada === jugadaRival ) {
            ganadorRonda = 'empate';
        } else if (
            (jugada === 'piedra' && jugadaRival === 'tijera') ||
            (jugada === 'papel' && jugadaRival === 'piedra') ||
            (jugada === 'tijera' && jugadaRival === 'papel')
        ) {
            ganadorRonda = id_usuario; 
        } else {
            ganadorRonda = 100;
        }

        if (ganadorRonda === id_usuario) {
            partida.victorias_j1 += 1;
        } else if (ganadorRonda === 100) {
            partida.victorias_j2 += 1;
        }

        if (partida.victorias_j1 === 3 || partida.victorias_j2 === 3) {
            
            partida.estado = 'finalizada';
            partida.ganador_id = (partida.victorias_j1 === 3) ? partida.id_jugador1 : partida.id_jugador2;
            
            await partida.save();

            return res.json({
                msg: 'Partida contra la Máquina finalizada',
                partida,
                jugada_tuya: jugada,
                jugada_maquina: jugadaRival,
                resultado_final: partida.ganador_id === id_usuario ? '¡Has ganado la partida!' : 'Has perdido la partida...'
            });

        } else {
            partida.jugada_j1 = null;
            partida.jugada_j2 = null;
            
            await partida.save();

            return res.json({ 
                msg: 'Ronda finalizada. Marcador: ' + partida.victorias_j1 + ' - ' + partida.victorias_j2,
                jugada_tuya: jugada,
                jugada_maquina: jugadaRival,
                ganador_ronda: ganadorRonda === 'empate' ? 'Empate' : (ganadorRonda === id_usuario ? 'Ganaste la ronda' : 'Perdiste la ronda')
            });
        }
    }

    res.json({
        msg: 'Jugada guardada correctamente. Esperando al rival...',
        partida
    });
}

const obtenerRanking = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll();

        const ranking = [];

        for (const usuario of usuarios) {
            
            const totalJugadas = await Partida.count({
                where: {
                    [Op.or]: [
                        { id_jugador1: usuario.id },
                        { id_jugador2: usuario.id }
                    ],
                    estado: 'finalizada'
                }
            });

            const totalGanadas = await Partida.count({
                where: {
                    ganador_id: usuario.id
                }
            });

            const porcentaje = totalJugadas === 0 ? 0 : (totalGanadas / totalJugadas) * 100;

            ranking.push({
                nombre: usuario.nombre, 
                jugadas: totalJugadas,
                ganadas: totalGanadas,
                winRate: parseFloat(porcentaje.toFixed(2)) 
            });
        }

        ranking.sort((a, b) => b.winRate - a.winRate);

        res.json({
            msg: 'Ranking calculado correctamente',
            ranking
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error al calcular el ranking' });
    }
}

const obtenerPartidasPendientes = async (req, res) => {
    try {
        const partidas = await Partida.findAll({
            where: {
                estado: 'pendiente',
                id_jugador2: null 
            }
        });

        res.json({
            partidas
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error al obtener las partidas' });
    }
}

const unirsePartida = async (req, res) => {
    const { id_partida, id_usuario } = req.body;

    try {
        const partida = await Partida.findByPk(id_partida);

        if (!partida) {
            return res.status(404).json({ msg: 'Partida no encontrada' });
        }

        if (partida.estado !== 'pendiente' || partida.id_jugador2 !== null) {
            return res.status(400).json({ msg: 'No puedes unirte a esta partida (ya está llena o finalizada)' });
        }

        if (partida.id_jugador1 === id_usuario) {
            return res.status(400).json({ msg: 'No puedes jugar contra ti mismo' });
        }

        partida.id_jugador2 = id_usuario;
        partida.estado = 'jugando';
        
        await partida.save();

        res.json({
            msg: '¡Te has unido a la partida! Que empiece el juego.',
            partida
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error al unirse a la partida' });
    }
}

export { crearPartida }
export { hacerJugada }
export { obtenerRanking }
export { obtenerPartidasPendientes }
export { unirsePartida }