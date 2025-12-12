import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';

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


        this.middlewares();
        this.routes();

        this.sockets();
    }

    async conectarDB() {

    }

    middlewares() {
        this.app.use( cors() );

        this.app.use( express.json() );

        this.app.use( express.static('public') );
    }

    routes() {

    }

    sockets() {
        this.io.on('connection', (socket) => {
            console.log('Cliente conectado:', socket.id);
            
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