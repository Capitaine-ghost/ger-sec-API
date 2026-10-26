import type {Request, Response} from "express"
import MyPrismaDB from "../config/DB.ts";
export const createPrestation = async(req : Request, res : Response)=>{
    try {
        const {designation, quantite,prixUnit, typePrestation} = req.body as {
            designation : string, 
            quantite : number, 
            prixUnit : number
            typePrestation : string, 
        }
        if(designation==="" || designation===undefined || typeof designation!=='string') return res.status(401).json({message :"Le champ designation est Obligatoire "}); 
        if (typeof typePrestation!=="string") return res.status(401).json({message:"veuillez indiquer le type de prestation avant de continuer"}); 
        if( prixUnit!==undefined && typeof prixUnit!=='number' ) return res.status(401).json({message:"Indiquez une valeur correcte pour le Prix unitaire de la prestation"});
         
        const selectedType = await MyPrismaDB.typePrestations.findUnique({where : {id : typePrestation}}); 
        if(selectedType===null){
            return res.status(401).json({message:"Le type de préstation indiqué n'existe pas"});    
        }
        let priceToUse : number = prixUnit? prixUnit : selectedType.prixUnit;
        priceToUse = prixUnit??selectedType.prixUnit 
       // calculer le benefice associée à la prestation
          let prestationBenefice : number = 0; 
           //estimation de la depense à base des fournitures utilisées
           const usedFournitures = await MyPrismaDB.typePrestationFourniture.findMany({
            where : {typePrestationId : selectedType.id}, 
            include : {fourniture : true}
           })
        const depense : number = usedFournitures.reduce((dep,usedfourniture)=> dep+=(usedfourniture.quantite * ((usedfourniture.fourniture.prixUnitVente===0)?usedfourniture.fourniture.prixAchat :usedfourniture.fourniture.prixUnitVente)), 0) *quantite; 
        prestationBenefice = (priceToUse *quantite) - depense;

        const createdPrestation = await MyPrismaDB.prestations.create({
            data : {
                designation, 
                prixUnit : priceToUse, 
                typePrestationId : typePrestation, 
                quantite, 
                benefice : prestationBenefice
            }
        })
        if(createdPrestation!==null){
            // enregistrer la transaction associée
                usedFournitures.forEach(async(fourn)=>{
                    await MyPrismaDB.fournitures.update({
                        data : {stock : (fourn.fourniture.stock- (fourn.quantite*2))},
                        where :{id : fourn.fournitureId}
                    })
                })
            const prestationTransaction = await MyPrismaDB.transactionCaisses.create({
                data : {
                    designation : `paiement de la prestation ${createdPrestation.designation}`,
                    prestationId : createdPrestation.id, 
                    type : "entrée", 
                    montant :(createdPrestation.prixUnit * createdPrestation.quantite)
                }
            })
            await MyPrismaDB.logHistoriques.createMany({
                data :[{
                    action : `Enregistrement d'une prestation`,
                    objetId : createdPrestation.id, 
                    userId : req.user.id
                },{
                    action : `Enregistrement d'une transaction`,
                    objetId : prestationTransaction.id, 
                    userId : req.user.id
                }]
            })
            return res.status(201).json({
                message : "Prestation enregistrée avec succès!"
            })
        }else{

            console.log("La transaction n'a pas pu être enregistrée")
            return res.status(201).json({message : "Prestation Enregistrée. \n Mais La transaction n'a pas pu être enregistrée"})
        }

    } catch (error) {
        console.log('Erreur survenue lors de la tentative d\'enregistre de la prestation', error); 
        return res.status(500).json({
            message : "Erreur survenue lors de la tentative d'enregistre de la prestation"
        })
    }
}

export const getAllPrestations = async(req : Request, res : Response)=>{
    try {
        const prestations = await MyPrismaDB.prestations.findMany({
             include :{type : true}
        })
        res.status(200).json({message : "Prestations récupérées avec succès!", prestations : prestations})
    } catch (error) {
         console.log('Erreur survenue lors de la récupération des prestations', error)
         res.status(500).json({message : "Erreur survenue lors de la récupération des prestations"})
    }
}

export const getPrestationById = async(req : Request, res : Response)=>{
    try {
        const prestationId=req.params.id;
        if(typeof prestationId!=="string"){
            return res.status(401).json({
                message:"Aucune prestation n'a été séléctionnée"
            })
        }
        const prestation = await MyPrismaDB.prestations.findUnique({
            where : {id : prestationId},
            include : {
                type : {
                    include : {
                        typePrestationFourniture : true
                    }
                }
            }
        })
        if (prestation!==null){
            return res.status(200).json({
                prestation : prestation
            })
        }else{
            return res.status(404).json({
                message:"La Préstation renseignée est invalide ou n'existe pas"
            })
        }
    } catch (error) {
        return res.status(500).json({
            message : `Erreur survenue lors de la tentative de récupération de la prestations`
        })
    }
}

export const deletePrestation = async(req : Request, res : Response)=>{
    try {
        const prestationId = req.params.id;

        if (typeof prestationId !== 'string' || prestationId.trim() === '') {
            return res.status(401).json({
                message : "Aucune prestation n'a été séléctionnée pour faire l'objet de l'opération"
            });
        }

        const prestationToDelete = await MyPrismaDB.prestations.findUnique({
            where : {id: prestationId, estActif : true}
        });

        if (prestationToDelete === null) {
            return res.status(404).json({
                message : "La prestation sélectionnée est introuvable ou a déjà été supprimée."
            });
        }

        const deletedPrestation = await MyPrismaDB.prestations.update({
            where : {id : prestationId},
            data : {
                estActif : false
            }
        });

        await MyPrismaDB.logHistoriques.create({
            data : {
                action : `Suppression de la prestation ${deletedPrestation.designation}`,
                objetId : deletedPrestation.id,
                userId : req.user.id
            }
        });

        return res.status(200).json({
            message : "Prestation supprimée avec succès!",
            prestation : deletedPrestation
        });
    } catch (error) {
        console.log('Erreur survenue lors de la tentative de suppression de la prestation', error);
        return res.status(500).json({
            message : `Erreur survenue lors de la tentative de suppression de la prestation`
        });
    }
}

export  const updatePrestation = async(req: Request, res : Response)=>{
    try {
        const prestationId = req.params.id;

        if(typeof prestationId !== "string" || prestationId.trim() === ""){
            return res.status(401).json({
                message : "Aucune prestation n'a été fournis pour continuer avec l'opération"
            });
        }

        const { designation, quantite, prixUnit, typePrestation} = req.body as {
            designation?: string;
            quantite?: number;
            prixUnit?: number;
            typePrestation?: string;
        };
      
        const prestationToUpdate = await MyPrismaDB.prestations.findUnique({
            where : {id : prestationId}
        });

        if (prestationToUpdate === null) {
            return res.status(404).json({
                message : "La prestation sélectionnée est introuvable."
            });
        }

        if (designation !== undefined && (typeof designation !== "string" || designation.trim() === "")) {
            return res.status(400).json({
                message : "Le champ designation est invalide."
            });
        }

        if (typePrestation !== undefined && typeof typePrestation !== "string") {
            return res.status(400).json({
                message : "Le type de prestation est invalide."
            });
        }

        if (quantite !== undefined && (typeof quantite !== "number" || Number.isNaN(quantite) || quantite <= 0)) {
            return res.status(400).json({
                message : "La quantité doit être un nombre positif."
            });
        }

        if (prixUnit !== undefined && (typeof prixUnit !== "number" || Number.isNaN(prixUnit) || prixUnit < 0)) {
            return res.status(400).json({
                message : "Le prix unitaire doit être un nombre valide."
            });
        }

        const selectedType = (typePrestation ?? prestationToUpdate.typePrestationId)
            ? await MyPrismaDB.typePrestations.findUnique({where : {id : typePrestation ?? prestationToUpdate.typePrestationId}})
            : null;

        if (typePrestation && selectedType === null) {
            return res.status(400).json({
                message : "Le type de prestation indiqué n'existe pas."
            });
        }
        
       let priceToUse : number = prixUnit? prixUnit : selectedType!.prixUnit
        priceToUse = prixUnit??selectedType!.prixUnit 
       // calculer le benefice associée à la prestation
          let prestationBenefice : number = 0; 
           //estimation de la depense à base des fournitures utilisées
           const usedFournitures = await MyPrismaDB.typePrestationFourniture.findMany({
            where : {typePrestationId : typePrestation!}, 
            include : {fourniture : true}
           })
           usedFournitures.forEach((fourn)=>{
            console.log(`Fourniture : ${fourn.fourniture.designation} qt : ${fourn.quantite} prix : ${fourn.fourniture.prixUnitVente}`)
           })
        const basedQt = quantite ??  prestationToUpdate.quantite
        const depense : number = usedFournitures.reduce((dep,usedfourniture)=> dep+=(usedfourniture.quantite * ((usedfourniture.fourniture.prixUnitVente===0)?usedfourniture.fourniture.prixAchat :usedfourniture.fourniture.prixUnitVente)), 0) *basedQt; 
        prestationBenefice = (priceToUse *(basedQt)) - depense;
        
    
        console.log(`calcul param; basedQt :${basedQt}\n depense : ${depense} , benef : ${prestationBenefice}`)
        const updatedPrestation = await MyPrismaDB.prestations.update({
            where : {id : prestationId},
            data : {
                designation : designation ?? prestationToUpdate.designation,
                quantite : quantite ?? prestationToUpdate.quantite,
                prixUnit : prixUnit ?? prestationToUpdate.prixUnit,
                benefice : prestationBenefice,
                typePrestationId : typePrestation ?? prestationToUpdate.typePrestationId,
            }
        });
         usedFournitures.forEach(async(fourn)=>{
            const recentQt = fourn.quantite; 
            let ecart = quantite? (recentQt - quantite) : recentQt;
            await MyPrismaDB.fournitures.update({
                data : {
                    stock : (fourn.fourniture.stock + ecart)
                },
                where : {id : fourn.fournitureId}
            })
         })
        await MyPrismaDB.logHistoriques.create({
            data : {
                action : `Modification de la prestation ${updatedPrestation.designation}`,
                objetId : updatedPrestation.id,
                userId : req.user.id
            }
        });

        return res.status(200).json({
            message : "Prestation modifiée avec succès!",
            prestation : updatedPrestation
        });
    } catch (error) {
        console.log("erreur survenue lors de la modification de la prestation", error);
        return res.status(500).json({
            message : "Erreur survenue lors de la tentative de modification de la prestation"
        });
    }
}

export const restaurePrestation=async(req : Request, res : Response)=>{
    try {
        const prestationId =req.params.id;
        if (typeof prestationId!=="string" || prestationId.trim()===""){
            return res.status(401).json({
                message :"Aucune Prestation n'a été fournis pour continuer l'opération"
            })
        }
        const prestationToRestaure = await MyPrismaDB.prestations.findUnique({
            where:{id:prestationId, estActif:false}, 
        })
        if(prestationToRestaure!==null){
            await MyPrismaDB.prestations.update({
                where : {id:prestationId}, 
                data : {estActif : true}
            })
            await MyPrismaDB.logHistoriques.create({
                data:{
                    action : `restauration de la prestation ${prestationToRestaure.designation}`,
                    objetId : prestationId,
                    userId : req.user.id
                }
            })
            return res.status(200).json({
                message:"Modification Effectuée"
            })
        }else{
            return res.status(404).json({
            message : "La prestation séléctionnée ne peut pas metre restaurée"
        })
        }
        
    } catch (error) {
        console.log("Erreur surevnue lors de la restauration de la presatation",error); 
        return res.status(500).json({
            message : "Erreur survenue lors de la tentative de restauration de la prestation"
        })
    }
}