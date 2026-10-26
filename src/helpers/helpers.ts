import bcrypt from "bcryptjs"
export const SecurizeMdp =async (mdp:string):Promise<string>=>{
   const salt = await bcrypt.genSalt();
   const hashed =await bcrypt.hash(mdp, salt);

   console.log("hashed passowrd : "+hashed); 

   return hashed
}

/**
 * vérifie si un mot de passe en claire correspond à un mot de passe cripté hashé avec un sele spécial
 * @param mdp string "le mot de passe en claire"
 * @param hashed string "le mot de passe hashé stocké dans la base de données"
 * @returns isVerified Promise<boolean> ""
 */
export const isMDPVerified = (mdp:string,hashed:string):boolean=>{

   const isVerified =  bcrypt.compareSync(mdp, hashed)

   return isVerified;

}


