import express from "express";
import Cors from "cors"
import cookieParser from "cookie-parser";

const app=express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())


import router from "./routes/user.route.js";
app.use('/user',router)

app.use(Cors({origin:process.env.Cors}))

export {app}