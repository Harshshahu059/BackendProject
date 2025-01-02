import mongoose, { Schema } from "mongoose";

const subscriptionSchema= mongoose.Schema({ //if error try  new.schema
    subscriber:{
        type:Schema.Types.ObjectId,// one who is subscribing
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,// one whom 'subscriber' is subscribing
        ref:"User"
    }

},{timestamps:true})
const subscriptionModle=mongoose.model("Subscription",subscriptionSchema)
export{subscriptionModle}