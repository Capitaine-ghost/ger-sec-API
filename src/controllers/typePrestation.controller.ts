import type {Request, Response} from "express"
import MyPrismaDB from "../config/DB.ts"

type FourniturePayload = {
    id?: string;
    quantite?: string | number;
};

const normalizedFournitures = (fournitures: unknown): Array<{ id: string; quantite?: number }> => {
    if (!Array.isArray(fournitures)) {
        return [];
    }

    return fournitures.flatMap((fourniture) => {
        if (typeof fourniture === "string") {
            return [{ id: fourniture }];
        }

        if (fourniture && typeof fourniture === "object") {
            const typedFourniture = fourniture as FourniturePayload;
            const id = typeof typedFourniture.id === "string" ? typedFourniture.id : "";
            const rawQuantite = typedFourniture.quantite;

            if (!id) {
                return [];
            }

            if (rawQuantite === undefined) {
                return [{ id }];
            }

            const quantite = Number.parseFloat(String(rawQuantite));

            if (Number.isNaN(quantite)) {
                return [];
            }

            return [{ id, quantite }];
        }

        return [];
    });
};

export const getAllTypePrestation =async (req : Request, res : Response)=>{
    try {

        const typePrestations = await MyPrismaDB.typePrestations.findMany({
            include : {
                typePrestationFourniture : {include :{fourniture :true}}
            }, 
            orderBy : [{designation : "asc"}]
        })
        if(typePrestations!==null){
            res.status(200).json({
                dataType : typePrestations
            })
        }
    } catch (error) {
      console.log('Erreur survenue lors de la tentative de récupération des données', error)
      return res.status(500).json({
        message : "Erreur survenue lors de la tentative de récupération des données !"
      })   
    }
}


export const createTypePrestation = async (req : Request, res : Response)=>{
    try {
        const { designation, quantiteMin, prixUnit, fournitures } = req.body as {
            designation?: unknown;
            quantiteMin?: unknown;
            prixUnit?: unknown;
            fournitures?: unknown;
        };

        if (
            typeof designation !== "string" ||
            !designation.trim() ||
            (typeof quantiteMin !== "string" && typeof quantiteMin !== "number") ||
            (typeof quantiteMin === "string" && !quantiteMin.trim()) ||
            (typeof prixUnit !== "string" && typeof prixUnit !== "number") ||
            (typeof prixUnit === "string" && !prixUnit.trim())
        ) {
            return res.status(400).json({
                message: "Les champs designation, quantiteMin et prixUnit sont requis."
            });
        }

        const parsedQuantiteMin = Number(quantiteMin);
        const parsedPrixUnit = Number(prixUnit);

        if (!Number.isInteger(parsedQuantiteMin) || !Number.isFinite(parsedPrixUnit)) {
            return res.status(400).json({
                message: "quantiteMin et prixUnit doivent être des nombres valides."
            });
        }

        if (fournitures !== undefined && !Array.isArray(fournitures)) {
            return res.status(400).json({
                message: "fournitures doit être un tableau."
            });
        }

        const parsedFournitures: Array<{ id: string; quantite: number }> = [];
        if (Array.isArray(fournitures)) {
            for (const fourniture of fournitures) {
                let id: unknown;
                let quantite: unknown;

                if (typeof fourniture === "string") {
                    id = fourniture;
                } else if (typeof fourniture === "object" && fourniture !== null) {
                    const payload = fourniture as Record<string, unknown>;
                    id = payload.id;
                    quantite = payload.quantite;
                }

                if (typeof id !== "string" || !id.trim()) {
                    return res.status(400).json({
                        message: "Chaque fourniture doit contenir un identifiant valide."
                    });
                }

                if (
                    quantite !== undefined &&
                    typeof quantite !== "number" &&
                    typeof quantite !== "string"
                ) {
                    return res.status(400).json({
                        message: "La quantite de chaque fourniture doit être numérique."
                    });
                }

                if (typeof quantite === "string" && !quantite.trim()) {
                    return res.status(400).json({
                        message: "La quantite de chaque fourniture doit être un entier positif."
                    });
                }

                const parsedQuantite = quantite === undefined ? 1 : Number(quantite);
                if (!Number.isInteger(parsedQuantite) || parsedQuantite < 1) {
                    return res.status(400).json({
                        message: "La quantite de chaque fourniture doit être un entier positif."
                    });
                }

                parsedFournitures.push({ id: id.trim(), quantite: parsedQuantite });
            }
        }

        const fournitureIds = parsedFournitures.map(({ id }) => id);
        if (new Set(fournitureIds).size !== fournitureIds.length) {
            return res.status(400).json({
                message: "Une même fourniture ne peut pas être répétée."
            });
        }

        const normalizedDesignation = designation.trim();
        const doesAlreadyExist = await MyPrismaDB.typePrestations.findFirst({
            where: {
                designation: normalizedDesignation,
                quantiteMin: parsedQuantiteMin,
                prixUnit: parsedPrixUnit
            }
        });

        if (doesAlreadyExist !== null) {
            return res.status(409).json({
                message: "Le type de prestation existe déjà."
            })
        }

        if (fournitureIds.length > 0) {
            const existingFournitures = await MyPrismaDB.fournitures.findMany({
                where: { id: { in: fournitureIds } },
                select: { id: true }
            });

            if (existingFournitures.length !== fournitureIds.length) {
                return res.status(404).json({
                    message: "Une ou plusieurs fournitures sélectionnées n'existent pas."
                });
            }
        }

        const createdType = await MyPrismaDB.typePrestations.create({
            data: {
                designation: normalizedDesignation,
                quantiteMin: parsedQuantiteMin,
                prixUnit: parsedPrixUnit,
                ...(parsedFournitures.length > 0
                    ? {
                        typePrestationFourniture: {
                            create: parsedFournitures.map(({ id, quantite }) => ({
                                quantite,
                                fourniture: {
                                    connect: { id }
                                }
                            }))
                        }
                    }
                    : {})
            }
        });

       
        await MyPrismaDB.logHistoriques.create({
            data: {
                action: `Création du type de prestation ${createdType.designation}`,
                objetId: createdType.id,
                userId: req.user.id
            }
        });

        return res.status(201).json({
            message: "Type créé avec succès!",
            typePrestation: createdType
        });
    } catch (error) {
        console.log("Erreur survenue lors de la tentative de création d'un nouvel type de prestation", error); 
        return res.status(500).json({
            message : "une Erreur est survenue, veuillez réessayer plus tard ! "
        })
    }
}

export const editTypePrestation = async (req: Request, res: Response) => {
    try {
        const typeId = req.params.typeId;
        if (typeof typeId !== "string" || !typeId) {
            return res.status(401).json({
                message: "Aucun type de prestation n'est sélectionné"
            });
        }

        const currentUser = (req as Request & { user?: { id?: string; admin?: boolean } }).user;

        const typeToEdit = await MyPrismaDB.typePrestations.findUnique({
            where: { id: typeId }
        });

        if (typeToEdit === null) {
            return res.status(404).json({
                message: "Aucun type de prestation trouvé"
            });
        }

        const { designation, quantiteMin, prixUnit, fournitures } = req.body as {
            designation?: string;
            quantiteMin?: string | number;
            prixUnit?: string | number;
            fournitures?: Array<FourniturePayload | string>;
        };

        const updateData: {
            designation?: string;
            quantiteMin?: number;
            prixUnit?: number;
            fournitures?: any;
        } = {};

        if (designation !== undefined) {
            if (!designation.trim()) {
                return res.status(400).json({
                    message: "La designation est invalide."
                });
            }
            updateData.designation = designation;
        }

        if (quantiteMin !== undefined) {
            const parsedQuantiteMin = Number.parseInt(String(quantiteMin), 10);
            if (Number.isNaN(parsedQuantiteMin)) {
                return res.status(400).json({
                    message: "quantiteMin doit être un nombre valide."
                });
            }
            updateData.quantiteMin = parsedQuantiteMin;
        }

        if (prixUnit !== undefined) {
            const parsedPrixUnit = Number.parseFloat(String(prixUnit));
            if (Number.isNaN(parsedPrixUnit)) {
                return res.status(400).json({
                    message: "prixUnit doit être un nombre valide."
                });
            }
            updateData.prixUnit = parsedPrixUnit;
        }

        if (fournitures !== undefined) {
            const normalized = normalizedFournitures(fournitures);
            const hasQuantiteOnFournitures = normalized.some(({ quantite }) => quantite !== undefined);

            if (normalized.length === 0) {
                updateData.fournitures = { deleteMany: {} };
            } else if (hasQuantiteOnFournitures) {
                updateData.fournitures = {
                    deleteMany: {},
                    create: normalized.map(({ id, quantite }) => ({
                        quantite: quantite ?? 1,
                        fourniture: {
                            connect: { id }
                        }
                    }))
                };
            } else {
                updateData.fournitures = {
                    connect: normalized.map(({ id }) => ({ id }))
                };
            }
        }

        const editedType = await MyPrismaDB.typePrestations.update({
            data: updateData,
            where: { id: typeId }
        });

        await MyPrismaDB.logHistoriques.create({
            data: {
                action: `Modification du type de prestation ${typeToEdit.designation}`,
                objetId: editedType.id,
                userId: currentUser?.id ?? ""
            }
        });

        return res.status(200).json({
            message: "Modification apportée",
            typePrestation: editedType
        });
    } catch (error) {
        console.log("Erreur survenue", error);
        return res.status(500).json({
            message: "Erreur survenue lors la tentative de modification"
        });
    }
};


export const deleteTypePrestation = async (req : Request, res : Response)=>{
    try {
        const idType= req.params.id; 
        if (typeof idType!=='string'){
            return res.status(401).json({
                message : "Aucun type de prestation n'est séléctionné"
            })
        }
        const typeToDelete = await MyPrismaDB.typePrestations.findUnique({
            where : {id : idType}
        })
        if(typeToDelete===null){
            return res.status(404).json({
                message : "Aucun type de prestation trouvé"
            })
        }
        const upadetd =await MyPrismaDB.typePrestations.update({
            where : {id : idType},
                data : {
                    estActif : false
                }
        })
        if(upadetd!==null){
            await MyPrismaDB.logHistoriques.create({
                data : {
                    action :`Suppression du type de prestation ${typeToDelete.designation}`,
                    objetId : upadetd.id,
                    userId : req.user?.id
                }
            })
            return res.status(200).json({
                message : "Suppression effectuée avec succès"
            })
        }else{
            return res.status(500).json({
                message : "Erreur inattendue survenue, impossible de poursuivre la suppression"
            })
        }
    } catch (error) {
        console.log('Erreur survenue lors de la tentative de suppression', error)
        res.status(500).json({message : "Erreur inattendue survenue, impossible de poursuivre la suppression"})
    }
}
