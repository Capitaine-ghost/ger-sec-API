import "dotenv/config"
const env ={
    PORT : process.env.PORT, 
    NODE_ENV : process.env.NODE_ENV || "developpement", 
    DB_PORT : process.env.DB_PORT, 
    USER_NAME : process.env.USER_NAME, 
    HOST_NAME : process.env.HOST_NAME, 
    DB_NAME : process.env.DB, 
    DB_PASSWORD : process.env.PASSWORD, 
    JWT_SECRET_KEY : process.env.JWT_SECRET_KEY

}

export default env