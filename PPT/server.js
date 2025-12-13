import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import db from './database/connection.js';
import { Partida } from './models/index.js'; // Solo necesitamos el modelo Partida aquí
import authRouter from './routes/auth.js';
import partidasRouter from './routes/partidas.js';

class Server {

    constructor() {
        this.app  = express();
        this.port = process.env.PORT || 8080;

        this.server = createServer( this.app );
        this.io = new SocketServer( this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        this.paths = {
            auth:     '/api/auth',
            partidas: '/api/partidas',
            usuarios: '/api/usuarios'
        }

        this.conectarDB();
        this.middlewares();
        this.routes();
        this.sockets(); 
    }

    async conectarDB() {
        try {
            await db.authenticate();
            console.log('Base de datos online');
        } catch (error) {
            console.error('Error al conectar a la BD:', error);
        }
    }

    middlewares() {
        this.app.use( cors() );
        this.app.use( express.json() );
        this.app.use( express.static('public') );
    }

    routes() {
        this.app.use( this.paths.auth, authRouter );
        this.app.use( this.paths.partidas, partidasRouter );
    }

    sockets() {
        this.io.on('connection', (socket) => {
            console.log('Cliente conectado:', socket.id);

            socket.on('unirse-sala', (partidaId) => {
                socket.join(partidaId);
                console.log(`Socket ${socket.id} unido a la sala: ${partidaId}`);
            });

            socket.on('hacer-jugada', async (payload) => {
                const { id_partida, id_usuario, jugada } = payload;
                console.log(`Jugada recibida: ${jugada} (Partida: ${id_partida}, Usuario: ${id_usuario})`);

                try {
                    const partida = await Partida.findByPk(id_partida);

                    if (!partida) {
                        socket.emit('error-jugada', { msg: 'Partida no encontrada' });
                        return;
                    }

                    if (id_usuario == partida.id_jugador1) {
                        partida.jugada_j1 = jugada;
                    } else {
                        partida.jugada_j2 = jugada;
                    }

                    await partida.save();
                    console.log('Jugada guardada correctamente en BD');

                    if (partida.jugada_j1 && partida.jugada_j2) {
                        
                        let ganadorRonda = 'empate';
                        const j1 = partida.jugada_j1;
                        const j2 = partida.jugada_j2;

                        if (j1 === j2) {
                            ganadorRonda = 'empate';
                        } else if (
                            (j1 === 'piedra' && j2 === 'tijera') ||
                            (j1 === 'papel'  && j2 === 'piedra') ||
                            (j1 === 'tijera' && j2 === 'papel')
                        ) {
                            ganadorRonda = partida.id_jugador1;
                            partida.victorias_j1 += 1;
                        } else {
                            ganadorRonda = partida.id_jugador2;
                            partida.victorias_j2 += 1;
                        }

                        partida.jugada_j1 = null;
                        partida.jugada_j2 = null;
                        
                        await partida.save();

                        this.io.emit('resultado-ronda', {
                            id_partida: partida.id,
                            ganador: ganadorRonda,
                            marcador: { j1: partida.victorias_j1, j2: partida.victorias_j2 },
                            jugadas: { j1, j2 }
                        });
                    }

                } catch (error) {
                    console.log(error);
                    socket.emit('error-jugada', { msg: 'Error en el servidor al guardar jugada' });
                }
            });

            socket.on('disconnect', () => {
                console.log('Cliente desconectado:', socket.id);
            });
        });
    }

    listen() {
        this.server.listen( this.port, () => {
            console.log('Servidor corriendo en puerto', this.port);
        });
    }
}

export { Server };