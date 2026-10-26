import { SecurizeMdp } from "../helpers/helpers.ts";
import MyPrismaDB from "./DB.ts";

const defaultUser ={
    nomUtilisateur :"Prévu Bienheureux", 
    motDePasse : "Jouvence@Emma1", 
}

 const SeedDefaultAdmin=async()=>{
     try {
        const doesUserAdmin = await MyPrismaDB.users.findUnique({where : {nomUtilisateur:defaultUser.nomUtilisateur}})
        if(doesUserAdmin){
            console.log("l'utilisateur par defaut existe déjà")
            return
        }else {
            const seededUser =await MyPrismaDB.users.create({
                data : {
                    nomUtilisateur : defaultUser.nomUtilisateur, 
                    motDePasse :await SecurizeMdp(defaultUser.motDePasse)
                }
            })
            if(seededUser!==null){
                console.log('Utilisateur par default ajouté avec succès')
                return; 
            }else{
                console.log("L'ajout de l'utilisateur par defaut à échoué")
                return; 
            }
        }
     } catch (error) {
         console.error("Erreur survenue lors de la configuration de l'utilisateur par défaut :")
         console.dir(error, { depth: null })
         return ; 
     }
}

export default SeedDefaultAdmin;