import{asyncHandler}from "../utils/asyncHandler.js"
import {apiResponse} from "../utils/apiResponse.js"
import {apiError} from "../utils/apiError.js"
import mongoose from "mongoose"
import {uplodeOnCloudinary} from "../utils/cloudinary.js"
import {videoModel} from"../models/video.models.js"
import {deleteFormCloudinary} from "../utils/cloudinary.delete.js"

const publishVideo=asyncHandler(async(req,res)=>{
    const {title,description}=req.body
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
    console.log(thumbnailUpload)
    if(!videoUpload||!thumbnailUpload){
        throw new apiError(500,"problem when upload videos in cloudinary!")
    }
     
     const isVideoPublish=await videoModel.create({
        title,
        description,
        videoFile:videoUpload.url,
        thumbnail:thumbnailUpload.url,
        thumbnailPublicId:thumbnailUpload.public_id,
        duration:videoUpload.duration
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
    .json(new apiResponse(200,video.videoFile,"video fetched  successfully form database"))
})

const updateVideoDetails=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
    const {title,description}=req.body
    const thumbnail=req.files?.thumbnail[0]?.path//don't write {thumbnail}

    
    if(!videoId||videoId.length!==24){
        throw new apiError(401,"Valid videoId (24 characters) is required to find video!")
    }
    const videoDetails=await videoModel.findById(videoId)
    
    if(!videoDetails){
        throw new apiError(404,"video not found !!")
    }
    
    
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
    if(!videoId||videoId.length!==24){
        throw new apiError(401,"Valid videoId (24 characters) is required to find video!")       
    }
    const video=await videoModel.findByIdAndDelete(videoId)
    if(!video){
        throw new apiError(404,"video not found !")
    }
    res.status(200)
        .json(new apiResponse(200,{video},"Video delete successfully"))
    
})
export {publishVideo,getVideoById,deleteVideoById,updateVideoDetails}