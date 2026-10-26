import type { Request, Response} from "express"
import MyPrismaDB from "../config/DB.ts"

export const getCommandes =async(req : Request, res : Response)=>{
    try{
        const commandes = await MyPrismaDB.commandes.findMany({
            include : {
                typeprestation : true
            }
        })
        if(commandes!==null){
            return res.status(200).json({
                commandes : commandes
            })
        }else{
            return res.status(500).json({
                message : "Une erreur inattendue est survenue"
            })
        }
    }catch(error){
        console.log("erreur survenue lors de la tentative de récupération de la liste des commande", error)
        return res.status(500).json({
            message : "Erreur survenue lors de la tentaive de récupèration de la liste de Commandes."
        })
    }
}