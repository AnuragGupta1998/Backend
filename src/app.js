import express from "express";
import cors from 'cors'
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true,
    optionsSuccessStatus:200 
}))

app.use(express.json({limit:"16kb"}));   //receiving data in json
app.use(express.urlencoded({extended:true,limit:"16kb"})); //receiving data from browser URL
app.use(express.static("public")); //to store images and pdf and file on server temprarily
app.use(cookieParser()); // access the user browser cookies and set the cookies mean we can perform CRUD operation on cookies


//routes import
import userRouter from "./routes/user.routes.js";

//declaration of routes as middleware
app.use('/api/v1/users',userRouter) //it send control to user.routes.js http://localhost:8000/api/v1/users



export { app };