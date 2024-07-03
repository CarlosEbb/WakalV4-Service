import express from "express";
const router = express.Router();
import { migrate } from '../controllers/migracionUsuariosController.js';
router.post('/usuarios', migrate);
export default router;