
import type {Request, Response}  from "express"
import MyPrismaDB from "../config/DB.ts"
export const getAllApprovisionement = async(req : Request, res: Response)=>{
    try {
        const approvisionements = await MyPrismaDB.approvisionnement.findMany({
            orderBy : {date : "desc"}
        })

        return res.status(200).json({
            approvisionements : approvisionements
        })
    } catch (error) {
      console.log('Erreur survenue lors de la récupération des Approvisionnement', error)   
    }
}

export const editApprovisionement =async (req : Request, res : Response)=>{
    try {
        const approvId = req.params.id; 
        if(typeof approvId!=="string" || approvId.trim()===""){
            return res.status(400).json({
                message : "Aucun approvisionnement n'a été sélectionné"
            })
        }

        const { quantite, uniteMesure } = req.body as {
            quantite?: number;
            uniteMesure?: string;
        };
        const nouvelleUnite = typeof uniteMesure === "string"
            ? uniteMesure.trim()
            : undefined;

        if(
            typeof quantite !== "number" ||
            !Number.isInteger(quantite) ||
            quantite <= 0 ||
            nouvelleUnite === undefined ||
            nouvelleUnite === ""
        ){
            return res.status(400).json({
                message : "La quantité et l'unité de mesure sont invalides"
            })
        }

        const updatedApprovisionnement = await MyPrismaDB.$transaction(async (tx) => {
            const approvisionnement = await tx.approvisionnement.findUnique({
                where : { id : approvId },
                include : { fourniture : true }
            });

            if(approvisionnement === null){
                return null;
            }

            const ancienneUnite = approvisionnement.uniteMesure.trim().toLowerCase();
            const nouvelleUniteNormalisee = nouvelleUnite.toLowerCase();
            const ancienExact = (ancienneUnite === "lot" || ancienneUnite === "carton")
                ? approvisionnement.quantite * approvisionnement.fourniture.nombreParLot
                : approvisionnement.quantite;
            const nouveauExact = (nouvelleUniteNormalisee === "lot" || nouvelleUniteNormalisee === "carton")
                ? quantite * approvisionnement.fourniture.nombreParLot
                : quantite;
            const differenceStock = nouveauExact - ancienExact;
            const stockFinal = approvisionnement.fourniture.stock + differenceStock;

            if(stockFinal < 0){
                throw new Error("STOCK_INSUFFISANT");
            }

            const editedApprovisionnement = await tx.approvisionnement.update({
                where : { id : approvId },
                data : {
                    quantite,
                    uniteMesure : nouvelleUnite
                }
            });

            await tx.fournitures.update({
                where : { id : approvisionnement.fourniture.id },
                data : { stock : stockFinal }
            });

            await tx.logHistoriques.create({
                data : {
                    action : `Modification de l'approvisionnement de la fourniture ${approvisionnement.fourniture.designation}, ${approvisionnement.quantite} ${approvisionnement.uniteMesure} vers ${quantite} ${nouvelleUnite}`,
                    objetId : approvisionnement.fourniture.id,
                    userId : req.user.id
                }
            });

            return editedApprovisionnement;
        });

        if(updatedApprovisionnement === null){
            return res.status(404).json({
                message : "Approvisionnement introuvable"
            });
        }

        return res.status(200).json({
            message : "Modification de l'approvisionnement effectuée",
            approvisionnement : updatedApprovisionnement
        });
    } catch (error) {
        if(error instanceof Error && error.message === "STOCK_INSUFFISANT"){
            return res.status(409).json({
                message : "La modification ne peut pas être effectuée car le stock serait négatif"
            });
        }

        console.log("erreur survenue lors de la modification de l'approvisionement", error)
        return res.status(500).json({
            message : "Erreur survenue lors de la tentative de modifcation de l'approvisionement"
        })
    }
}