import express from "express";
import Cors from "cors"

const app=express()

app.use(Cors({origin:process.env.Cors}))