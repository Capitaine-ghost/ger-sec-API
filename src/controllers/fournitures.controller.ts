import type {Request,Response} from "express"; 
import MyPrismaDB from "../config/DB.ts";

export const getAllFournitures = async(req: Request, res : Response)=>{
    try{
            const fournitures = await MyPrismaDB.fournitures.findMany({
                orderBy :[{designation : "asc"}, {prixAchat : "asc"}, {prixUnitVente : "asc"}]
            })

            res.status(200).json({
                fournitures : fournitures
            })
    }
    catch(error){
        console.log("Erreur survenue lors de la récupération de la liste des fournitures", error)
        return res.status(500).json({
            message:"Une erreur inattendue est survenue lors de la récupération de la liste des fournitures"
        })
    }
}


export const createFourniture =async (req:Request,res : Response)=>{
    try{
        const {designation, stock,prixAchat,prixUnitVente,uniteMesure,nombreParLot}=req.body as { 
            designation : string, 
            stock : number,
            prixAchat : number, 
            prixUnitVente : number,
            uniteMesure : string, 
            nombreParLot : number
        } 
        const doesFournitureExiste = await MyPrismaDB.fournitures.findFirst({
            where : {designation : designation}
        })

        if(doesFournitureExiste!==null){
            return res.status(401).json({
                message : "opération non autorisée, la fourniture existe déjà!"
            })
        }else{
            let ExactQuantite = (uniteMesure.toLowerCase()==="lot" || uniteMesure.toLowerCase()==="carton") ? (stock * nombreParLot) : stock
                  const newFourniture = await MyPrismaDB.fournitures.create({
            data : {
                designation, 
                stock : ExactQuantite,
                prixAchat, 
                prixUnitVente, 
                uniteMesure : "piéce", 
                nombreParLot
            }})

         if(newFourniture!==null){
            await MyPrismaDB.logHistoriques.create({
                data : {
                    action : `Création de la fourniture ${newFourniture.designation}`, 
                    userId : req.user.id, 
                    objetId : newFourniture.id,
                }})
            return res.status(201).json({
                message : "Fourniture ajoutée avec succès !", 
                fourniture : newFourniture
            })
         }
        }
    }catch(error){
        console.log("Erreur survenue lors que la création d'une nouvelle fourniture", error)
    }
}


export const editFournitures = async(req: Request, res : Response)=>{
    try {
        const fournitureId = req.params.id
        if(typeof fournitureId!=="string"){
            return res.status(500).json({
                message :"Fourniture non séléctionnée!"})
        }else{
            const editedFourniture =await MyPrismaDB.fournitures.update({
                data : {
                    ...req.body
                }, 
                where : {id : fournitureId}
            })

            if(editedFourniture!==null){
                await MyPrismaDB.logHistoriques.create({
                    data : {
                        action : `Modification de la fournitures ${editedFourniture.designation}`, 
                      userId : req.user.id, 
                      objetId: editedFourniture.id
        
                    }
                })
                return res.status(200).json({
                    message: "Modification Effectuée avec succès !", 
                    fournitures : editedFourniture
                })
            }
        }
    } catch (error) {
        console.log("Erreur survenue lors de la tentative d'édition de la fourniture"); 
        return res.status(500).json({
            message : "Erreur survenue lors de la tentative de modifcation"
        })
    }
}


export const deleteFournitures = async(req : Request, res : Response)=>{
    try {
        const fournitureId = req.params.id; 
        if(typeof fournitureId!=="string"){
            return res.status(401).json({
                message : "Aucun n'element n'a été séléctioné"
            })
        }else{
            const deletedFourniture = await MyPrismaDB.fournitures.update({
                data : {
                        estActif : false
                },
                    where : {id : fournitureId}
            })
        if (deletedFourniture !==null){
            await MyPrismaDB.logHistoriques.create({
                data : {
                    action : `Suppression de la fourniture ${deletedFourniture.designation}`, 
                    userId :req.user.id, 
                    objetId : deletedFourniture.id
                }
            })

            res.status(200).json({
                message : "Suppression effectuée avec succès!"
            })
        }else{
            return res.status(500).json({
                message : "Erreur Innattendue survenue lors de la tentative de suppression"
            })
        }
        }
    } catch (error) {
        console.log('Erreur survenue lors de la tentative de supression')
        return res.status(500).json({
            message :"Erreur inattendue survenue, impossible d'effectuer la supression"
        })
    }
}

export const makeApprovisionnement=async(req : Request, res : Response)=>{
    try{
        const fournitureId = req.params.id
        if(typeof fournitureId!=="string"){
            return res.status(401).json({message: "Opération refusée, aucune fourniture n'est séléctionnée"})
        }
        const {quantite, uniteMesure} =req.body as {quantite:number, uniteMesure : string}
        const fournitureToApprov = await MyPrismaDB.fournitures.findUnique({
            where :{id : fournitureId}
        })

        if(fournitureToApprov===null){
            return res.status(401).json({
                message : "Opération refusée, aucune fourniture n'est séléctionnée"
            })
        }else{
            if(fournitureToApprov.estActif===false){
                await MyPrismaDB.fournitures.update({
                    data : {
                        estActif : true
                    }, 
                    where : {id : fournitureToApprov.id}
                })
            }

            const approv = await MyPrismaDB.approvisionnement.create({
                data : {
                    quantite,
                    uniteMesure,
                    fourniture : {
                        connect : { id : fournitureToApprov.id}
                    }
                }
            })
            if(approv!==null){
                let ExactQuantite: number = (uniteMesure==="lot"  || uniteMesure==="carton") ? (quantite *fournitureToApprov.nombreParLot) : quantite;
                await MyPrismaDB.fournitures.update({
                    data : {
                        stock : fournitureToApprov.stock +ExactQuantite
                    }, 
                    where : {id :fournitureToApprov.id}
                })

                await MyPrismaDB.logHistoriques.create({
                    data : {
                        action : `Approvisionnement de la fourniture ${fournitureToApprov.designation}, ${quantite} ${uniteMesure} `,
                        objetId : fournitureToApprov.id, 
                        userId : req.user.id 
                    }
                })

                return res.status(201).json({
                    message : "Approvisionement Effectué"
                })
            }
        }
    }catch(error){
        console.log("Erreur survenue, impossible d'enregistrer l'approvisionnement", error)
    }
}

export const getFournitureById =async(req : Request, res : Response) =>{
    try {
        const fournitureId = req.params.id; 
        if(typeof fournitureId !=="string"){
            return res.status(401).json({
                message : "Aucune fourniture n'a été séléctionnée"})
        }
        const fourniture = await MyPrismaDB.fournitures.findUnique({
            where: {
                id  : fournitureId
            }, 
            include:{approvisionement : true}
        })
        return res.status(200).json({
            fourniture : fourniture
        })
    } catch (error) {
        console.log('Erreur survenue lors de la tentative de récupération de la fourniture', error)
        return res.status(500).json({message : "Erreur survenue lors de la tentative de récupération de la fourniture"})
    }
}

export const restaureFourniture = async(req : Request, res : Response)=>{
    try {
        const fournitureId = req.params.id; 
        if(typeof fournitureId!=="string" || fournitureId.trim()==""){
            return res.status(401).json({
                message : "Aucune Fourniture n'a été séléctionnée pour continuer l'opération"
            })
        }else{
            const fournitureToUpdate = await MyPrismaDB.fournitures.findUnique({
                where : {id : fournitureId, estActif: false}
            })
            if(fournitureToUpdate!==null){
                await MyPrismaDB.fournitures.update({
                    where : { id : fournitureId}, 
                    data : {
                        estActif : true
                    }
                })
            }else {
                return res.status(404).json({
                    message : "La fourniture séléctionnée ne peut être restaurée"
                })
            }
        }
    } catch (error) {
        console.log("erreur survenue lors de la tentative de restauration de la fourniture", error)
        return res.status(500).json({
            message : "Erreur survenue lors de la restauration de la fourniture"
        })
    }
}