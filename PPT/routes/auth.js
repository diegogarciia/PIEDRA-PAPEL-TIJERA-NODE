import { Router } from 'express';
import { check } from 'express-validator';
import { login, registro } from '../controllers/authController.js';
import { validarCampos } from '../middlewares/validar_campos.js';
import { Usuario } from '../models/index.js';

const router = Router();

router.post('/login',[
    check('email', 'El correo es obligatorio').isEmail(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    validarCampos
], login );

router.post('/registro',[
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('password', 'El password debe de ser más de 6 letras').isLength({ min: 6 }),
    check('email', 'El correo no es válido').isEmail(),
    validarCampos
], registro );

export default router;