import e from "express";
import env from "./config/env.ts";
import SeedDefaultAdmin from "./config/seedAdmin.ts";
import cors from "cors"

//importations des routers des differents modules
import userRouter from "./routes/user.routes.ts";

import CommandesRouter from "./routes/commandes.routes.ts";
import FournituresRouter from "./routes/fournitures.routes.ts";
import TypePrestationRouter from "./routes/typePrestation.routes.ts";
import VentesRouter from "./routes/ventes.routes.ts";
import PrestationRouter from "./routes/prestation.routes.ts";
import ApprovisionementRouter from "./routes/approvisionements.routes.ts";
import { errorHandler, NotFound } from "./middleware/errors.middleware.ts";
import MyPrismaDB from "./config/DB.ts";

import cookieParser from "cookie-parser"; // Importer le middleware cookie-parser

// installer cookies-parser
const app = e()
app.use(e.json())
app.use(cors({
    origin :"*",
    credentials : true, 
    allowedHeaders : ["Content-Type", "Authorization", "Set-Cookie"],
}))

app.use(cookieParser()); // Utiliser le middleware cookie-parser


//middleware personnalisé
// 

//utilisation des routers de l'app
app.get("/api",(req,res)=>{
    console.log("welcome")
     res.status(200).json({
        message : "Bienvenu sur mon api de gestion sécrétariat"
     })
})

app.use('/api/users', userRouter);

app.use('/api/prestations', PrestationRouter);
app.use('/api/commandes', CommandesRouter);
app.use('/api/types', TypePrestationRouter);
app.use('/api/ventes', VentesRouter);
app.use('/api/fournitures', FournituresRouter); 
app.use('/api/approvisionements', ApprovisionementRouter);

// Lancement du server
const PORT = env.PORT;


app.listen(PORT, async()=>{
    console.log("serveur ecoutant au port :"+PORT)
    try{
        console.log("Etablissment d'une connexion au serveur de base de données....")
       MyPrismaDB.$connect().then(async()=>{
        console.log("connexion établie")
        const users =await MyPrismaDB.users.findMany()
        if(!users.length){
            await SeedDefaultAdmin();
        }
       })
    }catch(error){
        console.log("Impossible de ce connecter à la base de donnée", error)
    }
})
app.use(NotFound)
app.use(errorHandler)