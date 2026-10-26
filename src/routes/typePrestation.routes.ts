import e, {Router} from "express"
import { createTypePrestation, deleteTypePrestation, editTypePrestation, getAllTypePrestation } from "../controllers/typePrestation.controller.ts";
import { authUser } from "../middleware/users.middleware.ts";
import { AdminOnly } from "../middleware/admin.middleware.ts";

const TypePrestationRouter : Router=e.Router(); 


TypePrestationRouter.get('/',authUser, getAllTypePrestation); 


TypePrestationRouter.post('/', AdminOnly,createTypePrestation);
TypePrestationRouter.put('/:typeId', AdminOnly, editTypePrestation);
TypePrestationRouter.delete('/:typeId', AdminOnly,deleteTypePrestation);


export default TypePrestationRouter; 