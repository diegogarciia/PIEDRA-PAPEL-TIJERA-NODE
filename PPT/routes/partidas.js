import { Router } from 'express';
import { check } from 'express-validator';
import { crearPartida } from '../controllers/partidasController.js';
import { validarCampos } from '../middlewares/validar_campos.js';

const router = Router();

router.post('/crear', [
    check('id_usuario', 'El ID del usuario es obligatorio').not().isEmpty(),
    validarCampos
], crearPartida );

export default router;