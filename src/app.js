import express from "express";
import Cors from "cors"

const app=express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))


import router from "./routes/user.route.js";
app.use('/user',router)

app.use(Cors({origin:process.env.Cors}))

export {app}