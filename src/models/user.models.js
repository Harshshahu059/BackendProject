import mongoose,{Schema} from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

const userSchema=new Schema({
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
userSchema.pre('save', async function (next) {
    if(!this.isModified("password"))  return next() //used by  ismodifed to check password in change 
     this.password = await bcrypt.hash(this.password,10) 
      next()
})
userSchema.methods.isPasswordMatch= async function (password) {
    return await bcrypt.compare(password,this.password);
}

// Now generating token using jwt
userSchema.methods.generateAccessToken=function (){
    return jwt.sign(
        {
            _id:this._id,
            username:this.username,
            email:this.email,
            fullname:this.fullname 
        },
        process.env.ACCESS_TOKEN_SECRET
        ,{expiresIn:process.env.ACCESS_TOKEN_EXPIRY }
    )
}
userSchema.methods.generateRefreshToken=function (){
    return jwt.sign (
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET
        ,{expiresIn:process.env.REFRESH_TOKEN_EXPIRY }
    )
}



export const usermodel=mongoose.model('User',userSchema)