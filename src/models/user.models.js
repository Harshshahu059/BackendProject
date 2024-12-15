import mongoose,{Schema, Types} from "mongoose";

const userScheam=new Schema({
    username:{
        type:String,
        required:true,
        lowerCase:true,
        unqiue:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        lowerCase:true,
        unqiue:true,
        trim:true,
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String , //couldinary url
        require:true
    },
    coverImage:{
        type:String
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        require:[true,"Password is required !!!!"]
    },
    refreshToken:{
        type:String
    }

},{timestamps:true})

export const usermodel=mongoose.model('User',userScheam)