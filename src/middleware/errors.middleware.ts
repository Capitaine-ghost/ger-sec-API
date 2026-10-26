import type { NextFunction, Request, Response } from "express";
import env from "../config/env.ts";
export const NotFound =(req : Request, res : Response, next : NextFunction):void =>{
   const error = new Error(`Ressource non trouvée, ${req.originalUrl}`)
   res.status(404)
   next(error)
} 

export const errorHandler=(error:any,req:Request, res:Response, next : NextFunction):void =>{

   const statusCode = error.statusCode  || (res.statusCode ===200 ? 500 :res.statusCode )
   res.status(statusCode)
   res.json({
      message : error.message, 
      stack :env.NODE_ENV ==="production" ? null : error.stack
   })
}

