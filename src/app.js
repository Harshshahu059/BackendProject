import express from "express";
import Cors from "cors"
import cookieParser from "cookie-parser";

const app=express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

//import routes
import userRouter from "./routes/user.route.js";
import videoroute from "./routes/video.route.js";
import playlistRoute from "./routes/playlist.route.js";
import commentRoute from "./routes/comment.route.js";
import tweetRoute from "./routes/tweets.route.js";
import likeRoute from "./routes/like.route.js";

//routes declaration
app.use('/user',userRouter)
app.use('/video',videoroute)
app.use('/playlist',playlistRoute)
app.use('/comment',commentRoute)
app.use('/tweet',tweetRoute)
app.use('/like',likeRoute)

app.use(Cors({origin:process.env.Cors}))

export {app}