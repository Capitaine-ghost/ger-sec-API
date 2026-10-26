import e, {Router} from "express"
import type { Request, Response } from "express";
import { loginAdmin,getMyHistorique,getUserInfosById, CreateUser, getAllUsers,getAllLogs, editUserData, getMyProfil, deleteLogicalyUser, editMyProfil, logoutUser } from "../controllers/user.controller.ts";
import { authUser } from "../middleware/users.middleware.ts";
import { AdminOnly } from "../middleware/admin.middleware.ts";
const userRouter: Router = e.Router(); 
// userRouter.get('/', (req : Request, res:Response)=>{
//     res.status(200).json({message : "Bienvenu à la Route users"})
// })


userRouter.post('/login', loginAdmin)
// chargement du middleware
// Admin only
userRouter.get('/', AdminOnly, getAllUsers)
userRouter.get('/logs', AdminOnly, getAllLogs)
userRouter.get('/:idUser/infos', AdminOnly,getUserInfosById)
userRouter.post('/create',AdminOnly, CreateUser)
userRouter.put('/:idUser/edit',AdminOnly, editUserData)
userRouter.delete('/:idUser/delete',AdminOnly, deleteLogicalyUser)

// All users
userRouter.put('/me',authUser, editMyProfil)
userRouter.get("/me", authUser, getMyProfil)
userRouter.get('/me/historiques', authUser,getMyHistorique)
userRouter.post("/logout", authUser, logoutUser)

export default userRouter