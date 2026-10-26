import type { Request, Response, NextFunction } from 'express';
import jsonwebtoken from "jsonwebtoken"
import env from "../config/env.ts"
export const AdminOnly =(req : Request, res : Response, next : NextFunction)=>{
    try{

        const token = req.cookies.token || req.headers.authorization?.split(" ")[1]; 
        if(!token){
            return res.status(401).json({message : "Accès non autorisé, veuillez vous connecter"})
        }
        const decoded = jsonwebtoken.verify(token,env.JWT_SECRET_KEY!); 
        if(decoded && typeof decoded === 'object' && decoded.role.toLowerCase() === 'admin') {
            next(); 
        }else{
            return res.status(403).json({message : "Accès non autorisé, vous n'êtes pas un administrateur"})
        }
    }catch(err){
        console.log("Erreur dans le middleware AdminOnly : "+err)
    }
}