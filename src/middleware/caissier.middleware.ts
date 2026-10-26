
import type { Request, Response, NextFunction } from "express";
import env from "../config/env.ts";
import jsonwebtoken from "jsonwebtoken"

export const caissierOnly =async(req : Request, res : Response, next : NextFunction)=>{
    try{
        const token = req.cookies['token'] || req.headers.authorization?.split(' ')[1]; 
        if(!token){
            return res.status(401).json({
                message : "La caissière doit être connecté pour continuer l'action"
            })
        }
        const  decodedcaissier = jsonwebtoken.verify(token,env.JWT_SECRET_KEY!); 
        if(decodedcaissier && typeof decodedcaissier ==="object" && ((decodedcaissier!.role.toLowerCase()==="caissière")||(decodedcaissier!.role.toLowerCase()==="caissier"))){
             next();
        }else{
            return res.status(403).json({
                Message : "Accès non autorisé, vous n'êtes pas un/une caissier(ère)"
            })
        }
    }catch(error){
        console.log("Erreur dans le middleware CaissierOnly : "+error)
    }
} 