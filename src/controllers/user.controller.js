import {asyncHandler} from "../utils/asyncHandler.js"
import {apiError} from "../utils/apiError.js"
import usermodel from "../models/user.models.js"
import {uplodeOnCloudinary} from "../utils/cloudinary.js"
import {apiResponse}from "../utils/apiResponse.js"

let registerUser=asyncHandler(async(req,res)=>{

    let {username,email,password,fullname}=req.body()
    let deatailVaild=[username,email,password,fullname].some((filed)=>
        filed?.trim()===""   
    )
    if (deatailVaild) {
        throw new apiError(401,"All fields are required")     
    }
    let user=usermodel.findOne(
      { $or: [{username},{email}]}
    )
    if(user){
        throw new apiError(400,"already existed!!")    
    }
    let avatarpath=req.files?.avatar[0]?.path;
    let coverimage=req.files?.avatar[0]?.path;
    if(!avatarpath){
        throw new apiError(400,"avatar file in reqired")
    }

   let avatarUploadlocal= await uplodeOnCloudinary(avatarpath)
   let coverimageUploadlocal=await uplodeOnCloudinary(coverimage)

   if(!avatarUploadlocal){
    throw new apiError(400,"avatar file in reqired")
}

 const userCreate=await usermodel.create({
    fullname,
    avatar:avatarUploadlocal.url,
    coverimage:coverimageUploadlocal?.url||"",
    email,
    password,
    username:username.toLowerCase()
})
const isUserCreated=await usermodel.findOne(userCreate._id).select(
    "-password -refreshToken"
)
if (!isUserCreated) {
   throw new apiError(500,"internal sever error")    
}

return res.status(200).json(
    new apiResponse(200,isUserCreated,"UserCreated Successfully!!")
)

    


})

    

export {registerUser}