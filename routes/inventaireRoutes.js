import express from 'express';
import cors from 'cors';
import { addInventoryState, modifyInventoryState, deleteInventoryState, viewInventoryState, validateInventoryState } from '../controllers/inventaireConroller.js';

const router = express.Router();
router.use(cors());

router.post('/create', addInventoryState);
router.put('/update/:id', modifyInventoryState);
router.delete('/delete/:id', deleteInventoryState);
router.get('/details/:id', viewInventoryState);
router.patch('/validate/:id_inventaire', validateInventoryState);

export default router;