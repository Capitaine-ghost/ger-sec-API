import type {Request, Response, NextFunction} from "express"; 
import jsonwebtoken from "jsonwebtoken"; 
import env from "../config/env.ts";
import MyPrismaDB from "../config/DB.ts";

export const authUser =async (req: Request, res : Response, next : NextFunction)=>{
    // récupération du token dans l'entête de la requête
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]; 

    if(!token) return res.status(401).json({message:"non connecté"}); 
    const decodedToken = jsonwebtoken.verify(token, env.JWT_SECRET_KEY!) as {id:string}; 

    const currentUser =await  MyPrismaDB.users.findUnique({
        where : {id: decodedToken.id}
    })


    req.user = currentUser; 

    next(); 


}