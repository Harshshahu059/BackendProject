import {usermodel} from "../models/user.models.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

const verifyJWT=asyncHandler(async(req, _,next)=>{
    try {
         const token=req.cookies?.accessToken||req.header('Authorization')?.replace('Bearer ','')
          if(!token){
            throw new apiError(401,"unAuthoriztion access")
          }
       const  decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
       const user =await usermodel.findById(decodedToken?._id).select("-password -refreshToken")
       if(!user){
        throw new apiError(401,"invaild access token")
       }
       req.user=user;
       next()
    } catch (error) {
        throw new apiError(401,error?.message|| "inviald access!!!!!")
        
    }
      
})
export {verifyJWT}