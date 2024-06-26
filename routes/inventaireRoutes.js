import express from 'express';
import { addInventoryState, modifyInventoryState, deleteInventoryState, viewInventoryState, getAllInventaires,validateInventoryState} from '../controllers/inventaireConroller.js';

const router = express.Router();
import cors from "cors";
router.use(cors());

router.post('/create', addInventoryState);
router.put('/update/:id', modifyInventoryState);
router.delete('/delete/:id', deleteInventoryState);
router.get('/details/:id', viewInventoryState);
router.patch('/validate/:id_inventaire', validateInventoryState);
router.get('/all-etat',getAllInventaires)

export default router;
