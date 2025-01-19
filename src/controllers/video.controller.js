import{asyncHandler}from "../utils/asyncHandler.js"
import{apiResponse} from "../utils/apiResponse.js"
import{apiError} from "../utils/apiError.js"
import mongoose from "mongoose"
import{uplodeOnCloudinary} from "../utils/cloudinary.js"
import{videoModel} from"../models/video.models.js"
import{deleteFormCloudinary} from "../utils/cloudinary.delete.js"
import{usermodel} from "../models/user.models.js"

const verfiyOwner=(ownerId,userId,msg)=>{
    const verfiy=ownerId.equals(userId)
   if(!verfiy){
    throw new apiError(401,msg)
   }
}

const getAllVideos = asyncHandler(async (req, res) => {
 const {page = 1, limit = 10,query,sortBy="createdAt",sortType,userId} = req.query
 // page is remaining  { $skip: (parseInt(page) - 1) * parseInt(limit) }
 // check at least one of them is recevied

 if (!query && !userId) {
    throw new apiError(400, "At least one of 'query' or 'userId' is required");
}

// check always sortType in 1,-1
const sortDirection = parseInt(sortType) === -1 ? -1 : 1; 

 const findVideoBy=query?
{ $or: [
    { title: { $regex: query, $options: "i" } },
    { description: { $regex: query, $options: "i" } },
] }: userId
? { owner: new mongoose.Types.ObjectId(userId) }
: {};

//aggergate pipline to find videos
 const videos= await videoModel.aggregate(
   [
    {
        $match:findVideoBy
    },
    {
        $sort:{
            sortBy:sortDirection
        }
    },
    { 
    // basically here is skip the previous video that already feacted
     $skip: (parseInt(page) - 1) * parseInt(limit) 
    },
    {
        $limit:parseInt(limit)
    },
    {
        $lookup:{
           from:"users",
           localField:"owner",
           foreignField:"_id",
           as:"owner",
           pipeline:[{
               $project:{
                   _id:1,
                   fullname:1,
                   username:1,
                   avatar:1
               }}
           ]
        }
       },
    {
        $project:{
            videoFile:1,
            thumbnail:1,
            title:1,
            description:1,
            owner: { $arrayElemAt: ["$owner", 0] }//or used $first by addfield
        }

    }

]
 )
 

if(!videos||videos.length===0){
    throw new apiError(404,"video not found!!")
}
res.status(200)
.json(new apiResponse(200,videos,"video fetched successfully!!"))    
})

const publishVideo=asyncHandler(async(req,res)=>{
    const {title,description}=req.body

    const userId=req.user._id
    // if(!title&&!description){

    //     throw new apiError("title and description is required!!")
    // }
    if (!title || !description) {
        throw new apiError(401,"Title and description are required!");
    }
    const video=req.files?.video[0]?.path
    const thumbnail=req.files?.thumbnail[0]?.path

    if(!video||!thumbnail){
        throw new apiError(401,"video and thumbnail are required!")
    }

    const videoUpload=await uplodeOnCloudinary(video)
    const thumbnailUpload=await uplodeOnCloudinary(thumbnail)
    if(!videoUpload||!thumbnailUpload){
        throw new apiError(500,"problem when upload videos in cloudinary!")
    }
     
     const isVideoPublish=await videoModel.create({
        title,
        description,
        videoFile:videoUpload.url,
        videoPublicId:videoUpload.public_id,
        thumbnail:thumbnailUpload.url,
        thumbnailPublicId:thumbnailUpload.public_id,
        duration:videoUpload.duration,
        owner:userId
     })
     if(!isVideoPublish){
        throw new apiError(500,"somthing went wrong !!");
     }
     const videoDetails=await videoModel.findById(isVideoPublish._id)
     if(!videoDetails){
        throw new apiError(500,"internal server error !!");
     }
     return res
     .status(200)
     .json(new apiResponse(200,videoDetails,"video publish succesfully!!"))

})

const getVideoById=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
    if(!videoId||videoId.length!==24){
        throw new apiError(401,"Valid videoId (24 characters) is required to find video!")       
    }
    const video=await videoModel.findById(videoId)
    
    if(!video){
        throw new apiError(404,"Video not found!!")
    }

    res.
    status(200)
    .json(new apiResponse(200,video,"video fetched  successfully form database"))
})

const updateVideoDetails=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
    const {title,description}=req.body
    const thumbnail=req.files?.thumbnail[0]?.path//don't write {thumbnail}
    const userId=req.user._id
    
    if(!videoId||videoId.length!==24){
        throw new apiError(401,"Valid videoId (24 characters) is required to find video!")
    }
    const videoDetails=await videoModel.findById(videoId)
    
    if(!videoDetails){
        throw new apiError(404,"video not found !!")
    }

   //verfiy user
   
   verfiyOwner(videoDetails.owner,userId)


    //updatesection
    
    
    if(!title||!description){
        throw new apiError(401,"title and description are required to updated details!")
    }
    if(!thumbnail){
        throw new apiError(401,"thumbnail is required to updated!!")
    }
    const thumbnailUpload= await uplodeOnCloudinary(thumbnail)
    
    if(!thumbnailUpload){
        throw new apiError(500,"Error when upload thumbnail on cloudinary")
    }
    await deleteFormCloudinary(videoDetails.thumbnailPublicId,"image")   

    // const video=await videoModel.findByIdAndUpdate(videoId,{
    //     $set:{
    //         title,
    //         description,
    //         thumbnail:thumbnailUpload.url,
    //         thumbnailPublicId:thumbnailUpload.public_id
    //     }
    // },
    // {
    //     new:true
    // })
    videoDetails.title = title;
    videoDetails.description = description;
    videoDetails.thumbnail = thumbnailUpload.url;
    videoDetails.thumbnailPublicId = thumbnailUpload.public_id;

    const updatedVideoDetails=await videoDetails.save();


  
    
    
    res.status(200)
    .json(new apiResponse(200,updatedVideoDetails,"check"))
})

const deleteVideoById=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
    const userId=req.user._id

    if(!videoId||videoId.length!==24){
        throw new apiError(401,"Valid videoId (24 characters) is required to find video!")       
    }

    const video=await videoModel.findById(videoId)
    console.log(video)
    if(!video){
        throw new apiError(404,"video not found !")
    }

    verfiyOwner(video.owner,userId,"onlyOwner can delete the video!!")

    // delete video form database 
    await videoModel.findByIdAndDelete(videoId)
    // delete video and thumbnail form cloudinary
    await deleteFormCloudinary(video.thumbnailPublicId,"image") 
    await deleteFormCloudinary(video.videoPublicId,"video")

    res.status(200)
        .json(new apiResponse(200,{video},"Video delete successfully"))
    
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId||videoId.length!==24){
        throw new apiError(401,"Valid videoId (24 characters) is required to find video!")
    }
    
    const video =await videoModel.findById(videoId)
    if(!video){
        throw new apiError(404,"video not found")
    }
    
    // if(publishVideo){
    //     video.isPublised=false
    // }else{
    //     video.isPublised=true
    // }
    verfiyOwner(req.user._id,video.owner,"Only owner can toggle!!")
    video.isPublished=!video.isPublished
   const togglePublishStatus= await video.save()
    
    res
    .status(200)
    .json(new apiResponse(200,togglePublishStatus,"Successfully toggled the publish status!"))

})


export {publishVideo,getVideoById,deleteVideoById,updateVideoDetails,togglePublishStatus,getAllVideos}