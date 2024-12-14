import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"

async function connectionDb(){
    try {
        let connection=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log("connected to db!!")
        
    } catch (error) {
        console.error(`error:${error}`)
        console.log("mongoose not connect to db")
    }
}
export default connectionDb