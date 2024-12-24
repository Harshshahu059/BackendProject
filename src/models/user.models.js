import mongoose,{Schema} from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

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
userScheam.pre('save', async function (next) {
    if(!this.isModified("password"))  return next() //used by  ismodifed to check password in change 
     this.password = await bcrypt.hash(this.password,10) 
      next()
})
userScheam.method.isPasswordMatch= async function (password) {
    return await bcrypt.compare(password,this.password);
}

// Now generating token using jwt
userScheam.method.generateAccessToken=function (){
    return jwt.sign (
        {
            _id:this._id,
            username:this.username,
            email:this.email,
            fullname:this.fullname 
        },
        process.env.ACCESS_TOKEN_SECRET
        ,{expiresIn:ACCESS_TOKEN_EXPIRY }
    )
}
userScheam.method.generateRefreshToken=function (){
    return jwt.sign (
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET
        ,{expiresIn:REFRESH_TOKEN_EXPIRY }
    )
}



export const usermodel=mongoose.model('User',userScheam)