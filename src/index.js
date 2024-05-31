// require("dotenv").config({ path: "./env" });
import dotenv  from "dotenv";

import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";



dotenv.config({
    path:"./env"
})

connectDB()


// import express from "express";
// const app = express();
// ;(async () => {
//     try {
//       const dbIntance=  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//       console.log(dbIntance.connection.host)

//         app.on("error",(error)=>{
//             console.log("error in app.on()",error);
//             throw error;
//         });

//         app.listen(process.env.PORT,()=>{
//             console.log(`app is listing on port ${process.env.PORT}`)

//         })
//     } catch (error) {
//         console.log("error",error);
//         throw error;    
//     }
// })(); 
