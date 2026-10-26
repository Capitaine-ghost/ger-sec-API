import e, { Router } from "express"
import { getCommandes } from "../controllers/commandes.controller.ts";
import { authUser } from "../middleware/users.middleware.ts";

const CommandesRouter :Router = e.Router(); 

CommandesRouter.get('/', authUser,getCommandes)

export default CommandesRouter; 
