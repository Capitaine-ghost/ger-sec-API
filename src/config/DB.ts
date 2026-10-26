import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client.ts";
import "dotenv/config"
import env from "./env.ts";

const requiredEnv = (name: string): string => {
    const value = process.env[name];
    if (value === undefined) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
};

// const adapter = new PrismaMariaDb({
//     host: "localhost",
//     user: "root",
//     password:"Jouvence%40Emma1",
//     database: requiredEnv("DB"),
//     connectionLimit: 5,
// })
// const MyPrismaDB = new PrismaClient({adapter})
const MyPrismaDB = new PrismaClient({
    adapter : new PrismaMariaDb({
        user : env.USER_NAME!, 
        database : env.DB_NAME!, 
        password:env.DB_PASSWORD!, 
        port :parseInt(env.DB_PORT!), 
        host : env.HOST_NAME!
    })
})

export default MyPrismaDB; 
