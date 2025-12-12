import { response, request } from 'express';
import { Usuario } from '../models/index.js';
import { generarJWT } from '../helpers/generar_jwt.js';

const login = async(req = request, res = response) => {
    const { email, password } = req.body;

    try {
        const usuario = await Usuario.findOne({ where: { email } });

        if ( !usuario ) {
            return res.status(400).json({
                msg: 'Usuario / Password no son correctos - correo'
            });
        }

        if ( usuario.password !== password ) {
            return res.status(400).json({
                msg: 'Usuario / Password no son correctos - password'
            });
        }

        const token = await generarJWT( usuario.id );

        res.json({
            usuario,
            token
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

const registro = async(req = request, res = response) => {
    const { nombre, email, password } = req.body;

    try {
        const existeEmail = await Usuario.findOne({ where: { email } });

        if ( existeEmail ) {
            return res.status(400).json({
                msg: 'Ya existe un usuario con ese correo'
            });
        }

        const usuario = await Usuario.create({ nombre, email, password });

        const token = await generarJWT( usuario.id );

        res.json({
            usuario,
            token
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }
}

export {
    login,
    registro
}