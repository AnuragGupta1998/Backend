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
import healthcheckRouter from "./routes/healthcheck.routes.js";
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"

//declaration of routes as middleware
app.use('/api/v1/users',userRouter) //it send control to user.routes.js http://localhost:8000/api/v1/users
app.use('/api/v1/healthcheck',healthcheckRouter) //it send control to user.routes.js http://localhost:8000/api/v1/users

app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)



export { app };