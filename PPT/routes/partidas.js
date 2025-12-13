import { Router } from 'express';
import { check } from 'express-validator';
import { crearPartida } from '../controllers/partidasController.js';
import { validarCampos } from '../middlewares/validar_campos.js';
import { hacerJugada } from '../controllers/partidasController.js';
import { obtenerRanking } from '../controllers/partidasController.js';

const router = Router();

router.post('/crear', [
    check('id_usuario', 'El ID del usuario es obligatorio').not().isEmpty(),
    validarCampos
], crearPartida );

router.post('/jugar', hacerJugada);

router.get('/ranking', obtenerRanking);

export default router;