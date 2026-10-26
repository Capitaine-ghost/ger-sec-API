import e, {Router} from "express"

import { caissierOnly } from "../middleware/caissier.middleware.ts";
import { createPrestation, deletePrestation, getAllPrestations, getPrestationById, restaurePrestation, updatePrestation } from "../controllers/prestations.controller.ts";
import { authUser } from "../middleware/users.middleware.ts";

const PrestationRouter : Router = e.Router(); 
// route reservée uniquement à la caissière, le authuser sera remplacée par caissiereOnly
PrestationRouter.get('/',authUser,getAllPrestations)
PrestationRouter.get('/:id',authUser,getPrestationById)
PrestationRouter.post('/',authUser,createPrestation); 

PrestationRouter.delete('/:id', authUser, deletePrestation)
PrestationRouter.put('/:id', authUser,updatePrestation); 
PrestationRouter.put('/:id/restaure', authUser,restaurePrestation)



export default  PrestationRouter; 
