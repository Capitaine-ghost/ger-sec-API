import type { Response, Request } from "express"
import MyPrismaDB from "../config/DB.ts"
import jsonwebtoken from "jsonwebtoken"
import { isMDPVerified, SecurizeMdp } from "../helpers/helpers.ts"
import env from "../config/env.ts"


// Installer JSONWEB Token puis finir le controller login
export const loginAdmin=async(req: Request, res : Response)=>{
    try {
        console.log(req.body)
        const {nomUtilisateur, motDePasse} =req.body
        const doesAdminExist =await MyPrismaDB.users.findUnique({where : {
           nomUtilisateur : nomUtilisateur
        }})
        if(doesAdminExist!==null){
            // verification de l'etat actif de l'admin
            if(doesAdminExist!.estActif===true){
              const doesMdpMatch = isMDPVerified(motDePasse, doesAdminExist!.motDePasse)
              console.log("the passewordMatching is : "+ doesMdpMatch)
              if(doesMdpMatch){
                //  generer le token d'accès 
                  const token = jsonwebtoken.sign(
                     {id: doesAdminExist.id,role :"admin"}, 
                      env.JWT_SECRET_KEY!,
                      {expiresIn : "1d"}
                  )
                //enregistrer l'action dans l'historique
                  const  logAction = await MyPrismaDB.logHistoriques.create({
                    data : {
                        action : "Connexion",
                        objetId : doesAdminExist.id,
                        creeLe : new Date(), 
                        userId : doesAdminExist.id
                    }
                  }) 
                // retourner les infos de connection
                  res.cookie('token',token, {
                    httpOnly : true, 
                    sameSite :"strict", 
                    secure : env.NODE_ENV==='production',
                    maxAge : 1*60*60*1000 // 1jour
                  })

                  res.status(200).json({user:doesAdminExist})
              }else{
                console.log("Le mot de Passe Fournit est incorrect")
                res.status(401).json({message: "le mot de passe fournit est incorrect"})
                return 
              }
            }else{
                 res.status(401).json({
                    message : "Votre compte n'est plus Active veuillez Contacter votre Super Admin Pour le Réactiver"
                })

                return 
            }
        }else{
            console.log(("Aucun utilisateur trouvé avec ce nom d'utilisateur"))
            res.status(404).json({
                message : "Aucun Utilisateur trouvé avec ce nom"
            })
            return 
        }
    } catch (error) {
        console.log("impossible d'effectuerble traitement", error)
        res.status(500).json({
            message:"Erreur survenue lors de la tentative de connexion"
        })
        return
    }

}

export const CreateUser =async(req:Request, res: Response,)=>{
    try {
        const {nomUtilisateur, nom, prenom,motDePasse,role}:{nomUtilisateur:string, nom : string, prenom:string, motDePasse:string, role:string}=req.body;
        // vérification si l'utilisateur existe 
        
        const ExistingUser = await MyPrismaDB.users.findFirst({
            where:{
                OR : [
                    {nomUtilisateur : nomUtilisateur.trim().toLowerCase()}, 
                    {AND : [
                        {nom : nom.trim().toLocaleLowerCase()}, 
                        {prenom : prenom.trim().toLowerCase()}
                    ]
                    }
                ]
            }
        })
        if(ExistingUser!==null){
            console.log("il existe déjà un Utilisateur")
            return res.status(409).json({
                message : "Les références entrées correspondent à ceux d'un utilisateur déjà existant"
            })

        }else{
            const newUser = await MyPrismaDB.users.create({
                data : {
                    nomUtilisateur : nomUtilisateur, 
                    nom : nom, 
                    prenom : prenom, 
                    role : role, 
                    motDePasse : await SecurizeMdp(motDePasse)
                }
            })

            if(newUser!==null){
                const logAction  =await  MyPrismaDB.logHistoriques.create({
                    data : {
                        action : `Création de l'utilisateur ${newUser.nomUtilisateur}`,
                        objetId : newUser.id, 
                        userId : req!.user!.id
                    }
                })
                console.log("Utilisatur créé avec succès !"); 
                res.status(201).json({
                    message : "utilisateur créé avec succès !", 
                    userCreated : newUser
                })
                // enregistre dans le log


                return 
            }else{
                console.log("erreur inattendue survenue")
                res.status(500).json({
                    message : "erreur inattendue survenue lors de la tentative de création de l'utilisateur"
                })
                return 
            }
        }
    } catch (error) {
        console.log("Erreur survenu lors de la tentative de création  d'un nouvel utilisateur", error)
        return res.status(500).json({
            message: "Erreur survenu lors de la tentative de création  d'un nouvel utilisateur"
        })
    }
}

export const getAllUsers=async (req:Request, res:Response)=>{
     try {
         const users = await MyPrismaDB.users.findMany(
            {
                select :{
                    nomUtilisateur : true, 
                    nom : true, 
                    prenom : true, 
                    role : true, 
                    id : true, 
                    profilImg : true, 
                    secretQuestion : false, 
                    motDePasse : false, 
                    secretReponse : false
                }, 
                orderBy : [{nom : "asc"},{prenom : "asc"},{nomUtilisateur : "asc"}]
            }
         ); 
         res.status(200).json({
            users : users
         })
     } catch (error) {
        console.log('Erreur survenue', error)
        res.status(500).json({message:"une Erreur est survenu, veuillez réessayer plus tard !"})
        return 
     }
}

export  const editUserData=async(req:Request, res :Response)=>{
    try {
        const idUser = req.params.idUser
        if (typeof idUser !== "string") {
            return res.status(400).json({
                message: "L'identifiant de l'utilisateur est invalide"
            })
        }

        const selectedUser =await MyPrismaDB.users.findUnique({
           where : {id : idUser}
        })

        if(selectedUser === null){
            return res.status(404).json({
                message : "Impossible d'effectuer la modification car l'utilisateur sélectionné est introuvable"
            })
        }

        const { motDePasse, ...userData } = req.body ?? {}
        const updatedUser = await MyPrismaDB.users.update({
            data: {
                ...userData,
                ...(motDePasse ? { motDePasse: await SecurizeMdp(motDePasse) } : {})
            },
            where : {id : idUser},
            select: {
                id: true,
                nomUtilisateur: true,
                nom: true,
                prenom: true,
                role: true,
                profilImg: true,
                estActif: true
            }
        })
        return res.status(200).json({
            message: "Utilisateur modifié avec succès",
            user: updatedUser
        })
    } catch (error) {
        console.log('erreur survenue', error)
        return res.status(500).json({
            message : "Erreur survenue lors de l'édition des inforamtions de l'utilisateur"
        })
    }
}

export const getMyProfil =async (req:Request,res : Response )=>{
    return res.status(200).json({
        userData : req!.user
    })
}

export const deleteLogicalyUser = async(req : Request, res: Response)=>{
    try {
        const idUser =req.params.idUser;
         if(typeof idUser!=="string"){
            return res.status(401).json({message : "L'identifiant de l'utilisateur est introuvable"})
         }
        const userToDelete = await MyPrismaDB.users.findUnique({
            where : {
                id : idUser
            }
        })
//   dans le cas l'utilisateur existe
        if(userToDelete!==null){
                const deletedUser = await MyPrismaDB.users.update({
                    data : {
                            estActif : false
                    }, 
                    where : {
                        id : idUser
                    }
                })
            const logAction = await MyPrismaDB.logHistoriques.create({
                data : {
                    action :` Suppression de l'utilisateur ${userToDelete.nomUtilisateur}`,
                    userId : req!.user.id, 
                    objetId : userToDelete.id}})
            res.status(200).json({
                message : "Suppression Effectuée avec succès !"
            })
        }
        
    } catch (error) {
        console.log('Erreur surevnue', error)
        return res.status(500).json({
            message : "Erreur survenue lors de la tentative de suprression de l'utilisateur"
        })
    }
}

export const editMyProfil = async(req:Request, res: Response)=>{
    try{
        const idUser = req!.user!.id
        console.log("l'id de l'utilisateur connecté est : "+idUser)
        const { motDePasse, ...userData } = req.body ?? {}
        const updatedUser = await MyPrismaDB.users.update({
            data:{
                ...userData, 
                ...(motDePasse ? { motDePasse: await SecurizeMdp(motDePasse) } : {})
            }, 
            where : {id : idUser},
        })
        if(updatedUser!==null){
            const logAction = await MyPrismaDB.logHistoriques.create({
                data : {
                    action :` Édition du profil de l'utilisateur ${updatedUser.nomUtilisateur}`,
                    userId : req!.user.id, 
                    objetId : updatedUser.id}
            })
            res.status(200).json({
                message : "Profil mis à jour avec succès !",
                user: updatedUser
            })
        }else{
            res.status(404).json({
                message : "Impossible de mettre à jour le profil, l'utilisateur est introuvable"
            })
        }
    }catch(err){
        console.log("Erreur survenue lors de la tentative d'édition du profil de l'utilisateur : "+err)
        res.status(500).json({message : "Erreur survenue lors de la tentative d'édition du profil de l'utilisateur"
        })
    }
}

export const logoutUser = async(req:Request, res:Response)=>{
    try{
         await MyPrismaDB.logHistoriques.create({
            data : {
                action : "Déconnexion",
                userId : req!.user!.id,
                objetId : req!.user!.id
            }
        })
        res.clearCookie('token', {
            httpOnly : true, 
            sameSite :"strict",
        });
       

        res.status(200).json({ message : "Déconnexion réussie !" });
    } catch (error) {
        console.log("Erreur survenue lors de la tentative de déconnexion", error);
        res.status(500).json({ message : "Erreur survenue lors de la tentative de déconnexion" });
    }
}

export const getMyHistorique = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id
        const logs = await MyPrismaDB.logHistoriques.findMany({
            where: { userId: userId },
            orderBy: { creeLe: 'desc' }
        })
        res.status(200).json({ logs: logs });
    }catch(error){
        console.log("Erreur survenue lors de la tentative de récupération de l'historique de l'utilisateur", error);
        res.status(500).json({ message : "Erreur survenue lors de la tentative de récupération de l'historique de l'utilisateur" });
    }
}

export const getUserInfosById =async(req: Request, res : Response)=>{
    try{
        const idUser = req.params.idUser
        if(typeof idUser!=="string"){
            return res.status(401).json({
                message : "L'identifiant de l'utilisateur est introuvable"
            })
        }

        const userInfos = await MyPrismaDB.users.findUnique({
            where : {id : idUser},
            select : {
                id : true,
                nomUtilisateur : true,
                nom : true, 
                prenom : true,
                role : true, 
                profilImg : true, 
                estActif : true,
                historiLog :{
                    orderBy : {creeLe : "desc"},
                }
            },
        })

        if(userInfos!==null){
            res.status(200).json({
                userInfos : userInfos
            })
        }else{
            res.status(404).json({
                message : "Aucun utilisateur trouvé avec cet identifiant"
            })
        }


    }catch(error){
        console.log('Erreur survenue lors de la tentative de récupération des informations de l\'utilisateur', error)
      res.status(500).json({
        message : "Erreur survenue lors de la tentative de récupération des informations de l'utilisateur"
      })
    }
}


export const getAllLogs =async(req:Request, res:Response)=>{
    try{
        const logs = await MyPrismaDB.logHistoriques.findMany({
            orderBy : {creeLe : "desc"}
        })
        res.status(200).json({
            logs : logs
        })
    }catch(error){
        console.log('Erreur survenue lors de la tentative de récupération des logs', error)
        res.status(500).json({
            message : "Erreur survenue lors de la tentative de récupération des logs"
        })
    }
}