import {asyncHandler} from "../utils/asyncHandler.js"
import {apiError} from "../utils/apiError.js"
import {usermodel} from "../models/user.models.js"
import {uplodeOnCloudinary} from "../utils/cloudinary.js"
import {apiResponse} from "../utils/apiResponse.js"



    const generateAccessAndrefreshToken=async(userId)=>{
   try {
    const user=await usermodel.findById(userId)
    const accessToken=user.generateAccessToken()
    const refreshToken=user.generateRefreshToken()
    user.refreshToken=refreshToken;
     await user.save({validateBeforeSave:false})
     console.log(accessToken)
      return{accessToken,refreshToken}
    
   } catch (error) {
    
       throw new apiError(500,"Someting went wrong while generated access and refersh token")
   }

    }



const registerUser=asyncHandler(async(req,res)=>{


    let {username,email,password,fullname}=req.body
    // console.log(req.body)
    // console.log(req.files)
    let deatailVaild=[username,email,password,fullname].some((filed)=>
        filed?.trim()===""   
    )
    if (deatailVaild) {
        throw new apiError(401,"All fields are required")     
    }
    let user=await usermodel.findOne(
      { $or: [{username},{email}]}
    )
    if(user){
        throw new apiError(400,"already existed!!")    
    }
    let avatarpath=req.files?.avatar[0]?.path;
    

    let coverimagepath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverimagepath=req.files.coverImage[0].path      
    }
    if(!avatarpath){
        throw new apiError(400,"avatar file in reqired")
    }

   let avatarUploadlocal= await uplodeOnCloudinary(avatarpath)
   let coverimageUploadlocal=await uplodeOnCloudinary(coverimagepath||"")

   if(!avatarUploadlocal){
    throw new apiError(400,"avatar file in reqired")
}

 const userCreate=await usermodel.create({
    fullname,
    avatar:avatarUploadlocal.url,
    coverImage:coverimageUploadlocal?.url||"",
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
const loginUser=asyncHandler(async (req,res)=>{
    let{username,password,email}=req.body
     if((!username&&!email)){
        throw new apiError(401,"username or email is required")
    }

let user=await usermodel.findOne( {$or:[{username},{email}]})
if(!user){
    throw new apiError(401,"username or email is invaild")
}
let isvaild=await user.isPasswordMatch(password)
if (!isvaild) {
    throw new apiError(401,"invaild entry")
       
}
const {accessToken,refreshToken}= await generateAccessAndrefreshToken(user._id)
const loggedInUser=await usermodel.findById(user._id).select("-password -refreshToken") 

const options={
    httpOnly:true,
    secure:true
}
return res.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
.json(
    new apiResponse(200,{
        user:loggedInUser,accessToken,refreshToken //data
    },"User Login successfully"//message 
)
)


})

let logoutUser=asyncHandler(async(req,res)=>{
    // remove user ke refersh token 
    //remove user access token
    await usermodel.findByIdAndUpdate(
        req.user._id,
        { 
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken" ,options)
    .clearCookie("refreshToken" ,options)
    .json(new apiError(200,{},"user logout successfulaly"))

})

    


export {registerUser,loginUser,logoutUser}