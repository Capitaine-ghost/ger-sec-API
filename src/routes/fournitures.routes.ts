import e, { Router } from "express"
import { authUser } from "../middleware/users.middleware.ts";
import { createFourniture, deleteFournitures, editFournitures, getAllFournitures, getFournitureById, makeApprovisionnement, restaureFourniture } from "../controllers/fournitures.controller.ts";

const FournituresRouter : Router =e.Router(); 

FournituresRouter.get('/', authUser,getAllFournitures);
FournituresRouter.get("/:id", authUser, getFournitureById); 

FournituresRouter.post('/',authUser,createFourniture)
FournituresRouter.post("/:id/approvisionement", authUser,makeApprovisionnement)

FournituresRouter.put('/:id',authUser,editFournitures); 
FournituresRouter.delete('/:id', authUser, deleteFournitures); 
FournituresRouter.put("/:id/restaure", authUser, restaureFourniture)



export default FournituresRouter; 