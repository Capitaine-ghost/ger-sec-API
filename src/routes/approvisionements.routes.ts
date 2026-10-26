import e from "express"
import { authUser } from "../middleware/users.middleware.ts";
import { editApprovisionement, getAllApprovisionement } from "../controllers/approvisionement.controller.ts";

const ApprovisionementRouter = e.Router()

ApprovisionementRouter.get('/', authUser, getAllApprovisionement)
ApprovisionementRouter.put('/:id', authUser, editApprovisionement)

export default ApprovisionementRouter;