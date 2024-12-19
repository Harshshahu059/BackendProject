import express from "express";
import connectionDb from "./db/database.js";
import Dotenv  from "dotenv";
import {app} from './app.js'
Dotenv.config(
    {
        path:'./env'
    }
)
connectionDb()
.then(()=>{
    app.on("error",(error)=>{
        console.log(error)
    })
    app.listen(process.env.PORT||8000,()=>{
        console.log(`server at runing at port :${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.error(`database  connected  failed!!`,error)

})

// app.listen(process.env.PORT,()=>{
//     console.log(`sever is listen at ${process.env.PORT}`)
// })

