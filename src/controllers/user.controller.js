import {asyncHandler} from "../utils/asyncHandler.js"
import {apiError} from "../utils/apiError.js"
import {usermodel} from "../models/user.models.js"
import {uplodeOnCloudinary} from "../utils/cloudinary.js"
import {apiResponse} from "../utils/apiResponse.js"
import {deleteFormCloudinary} from '../utils/cloudinary.delete.js'
import jwt from "jsonwebtoken"



const generateAccessAndrefreshToken=async(userId)=>{
   try {
    const user=await usermodel.findById(userId)
    const accessToken=user.generateAccessToken()
    const refreshToken=user.generateRefreshToken()
    user.refreshToken=refreshToken;
     await user.save({validateBeforeSave:false})
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
    avatarPublicId:avatarUploadlocal?.public_id,
    coverImage:coverimageUploadlocal?.url||"",
    coverImagePublicId:coverimageUploadlocal?.public_id,
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
if(!isvaild) {
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

const logoutUser=asyncHandler(async(req,res)=>{
    // remove user ke refersh token 
    //remove user access token
    await usermodel.findByIdAndUpdate(
        req.user._id,
        { 
            $set:{
                refreshToken:undefined//here is promblem
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
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new apiResponse(200,{},"user logout successfully"))

})

const refershAccessToken=asyncHandler(async(req,res)=>{
    const token=req.cookies.refreshToken||req.body.refreshToken;
    if(!token){
        throw new apiError(404,"refresh token is not found!!")
    }
    const decodedToken= jwt.verify(token,process.env.REFRESH_TOKEN_SECRET)
    const user= await usermodel.findById(decodedToken?._id)
    if(!user){
        throw new apiError(404," user not found!!")
    }
    if(token!==user?.refreshToken){
        throw new apiError(401,"invaild refresh token!!")
    }

  const {accessToken,refreshToken}=await generateAccessAndrefreshToken(user._id)
  const options={
    httpOnly:true,
    secure:true
}
console.log(refreshToken)
  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new apiResponse(200,
    {accessToken,refreshToken:refreshToken}
    ,"Succesfully genarate accessToken"))

})

const changePassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body
    const user=await usermodel.findById(req.user._id)
    if(!user){
        throw new apiError(404,"user not found")
    }
    const vaildPassword=await user.isPasswordMatch(oldPassword)
    if(!vaildPassword){
        throw new apiError(401,"old password is not match !!")
    }
    user.password=newPassword
    await user.save({validateBeforeSave:false}) 
    return res.status(200)
              .json(new apiResponse(200,{},"password change succesfully"))

})

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new apiResponse(200,req.user,"current user fetched successfully"))
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
    const{fullname,email}=req.body
    if(!fullname||!email){
        throw new apiError(400,"must be provide both email and fullname")
    }
    const user=await usermodel.findByIdAndUpdate(
        req.user._id,
        {
            
          $set:{
            fullname,//fullname:fullname
            email //email:email
          }
            
        },
        {new:true}
    ).select("-password")
    return res.
    status(200)
    .json(new apiResponse(200,user,"user update succesfully!!"))
   
})

const updateUserAvatar=asyncHandler(async(req,res)=>{
    if(!req.user.avatarPublicId){
       throw new apiError(401,"invaild access cannot update avatar !!")
    }
    await deleteFormCloudinary(req.user.avatarPublicId,"image")
    const avatarpath=req.file?.path
    if(!avatarpath){
        throw new apiError(404,"avatar image  not found upload it first")
    }
    const avatarUpload=await uplodeOnCloudinary(avatarpath)

    const user=await usermodel.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                avatar:avatarUpload.url,
                avatarPublicId:avatarUpload.public_id
            }
        },
        {new:true}
    ).select("-password")
    res.status(200)
    .json(new apiResponse(200,user,"avatar change succesfully!"))

    
})

const updateUserCoverimage=asyncHandler(async(req,res)=>{
    if(!req.user.coverImagePublicId){
        throw new apiError(401,"invaild access cannot update avatar !!")
    }
    await deleteFormCloudinary(req.user.coverImagePublicId,"image")
    const coverImage=req.file?.path
    if(!coverImage){
        throw new apiError(404,"coverImage image  not found upload it first")
    }
    const coverImageUpload=await uplodeOnCloudinary(coverImage)
    const user=await usermodel.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                coverImage:coverImageUpload.url,
                coverImagePublicId:coverImageUpload.public_id
            }
        },
        {new:true}
    ).select("-password")
    res.status(200)
    .json(new apiResponse(200,user,"coverImage change succesfully!"))
    
    
})

const getUserChannelProfile=asyncHandler(async(req,res)=>{
    const {username}=req.paramas
    if(!username?.trim()){
        throw new apiError(401,"Username not found provide username")
    }
    //piplelines
    const channel=await usermodel.aggregate(
        [
            {
                $match:{
                    username:username?.toLowerCase()
                }
            },
            {
                $lookup:{
                    form:"subscriptions",
                    localField:"_id",
                    foreignField:"channel",
                    as:"subscribers"
                }
            },
            {
                $lookup:{
                    from:"subscriptions",
                    localField:"_id",
                    foreignField:"subscriber",
                    as:"subscribedTo"
                }
            },
            {
                $addFields:{
                    subscribersCount:{
                        $size:"$subscribers"
                    },
                    subscribedToCount:{
                        $size:"$subscribedTo"
                    },
                    isSubscribed:{
                        $cond:{
                            if:{$in:[req.user?._id,"subscribers.subscriber"]},
                            then:true,
                            else:false
                        }
                    }
                    
                }
            },
            {
                $project:{
                    fullname:1,
                    username:1,
                    email:1,
                    subscribersCount,
                    subscribedToCount,
                    isSubscribed,
                    avatar,
                    coverImage
                }
            }
        ]
    )
    if(!channel?.length){
        throw new apiError(401,"channel does not exist")
    }
    res.status(200)
    .json( 
        new apiResponse (
            200,
            channel[0],
            "User channnel fetched successfully"
        ))
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refershAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverimage,
    getUserChannelProfile
}