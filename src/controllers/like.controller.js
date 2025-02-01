import like from "../models/likes.modle.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import mongoose from "mongoose"

const toggleVideoLike=asyncHandler(async(req,res)=>{
   const userId=req.user._id
   const {videoId}=req.params

   if(!videoId){
      throw new apiError(400,"videoId is required to togglelike!")
   }

   const checkAllreadyLike=await like.findOne({
      video:videoId,
      likedBy:userId
   })
   
  if(checkAllreadyLike){   

    
   const result=await like.findByIdAndDelete(checkAllreadyLike._id)
   res.status(200)
  .json(new apiResponse(200,result,"Remove liked successfully "))


  }else{
   const result=await like.create(
      {
         video:videoId,
         likedBy:userId
      }
   )
   res.status(200)
   .json(new apiResponse(200,result,"Like video successfully "))
  }
    
  
})
const toggleCommentLike=asyncHandler(async(req,res)=>{
   const userId=req.user._id
   const {commentId}=req.params

   if(!commentId){
      throw new apiError(400,"commentId is required to togglelike!")
   }

   const checkAllreadyLike=await like.findOne({
      Comment:commentId,
      likedBy:userId
   })
   
  if(checkAllreadyLike){   

    
   const result=await like.findByIdAndDelete(checkAllreadyLike._id)
   res.status(200)
  .json(new apiResponse(200,result,"Remove liked successfully "))


  }else{
   const result=await like.create(
      {
         Comment:commentId,
         likedBy:userId
      }
   )
   res.status(200)
   .json(new apiResponse(200,result,"Like comment successfully "))
  }
    
  
})
const toggleTweetLike=asyncHandler(async(req,res)=>{
   const userId=req.user._id
   const {tweetId}=req.params

   if(!tweetId){
      throw new apiError(400,"tweetId is required to togglelike!")
   }

   const checkAllreadyLike=await like.findOne({
      tweet:tweetId,
      likedBy:userId
   })
   
  if(checkAllreadyLike){   

    
   const result=await like.findByIdAndDelete(checkAllreadyLike._id)
   res.status(200)
  .json(new apiResponse(200,result,"Remove liked successfully "))


  }else{
   const result=await like.create(
      {
         tweet:tweetId,
         likedBy:userId
      }
   )
   res.status(200)
   .json(new apiResponse(200,result,"Like tweet successfully "))
  }
    
  
})

const getLikedVideos = asyncHandler(async (req, res) => {
   //TODO: get all liked videos
    const userId=req.user._id
   if(!userId){
      throw new apiError(400,"userId is required !")
   }

   const likedVideo=await like.aggregate(
      [
         {
         $match:{
            likedBy:new mongoose.Types.ObjectId(userId),
            video:{$exists:true}// this check video is exist in data
         }

      },
      {
         $lookup:{
            from:"videos",
            localField:"video",
            foreignField:"_id",
            as:"videoDetails",
            pipeline:[
               {
                  $project:{
                     thumbnail:1,
                     _id:1,
                     videoFile:1,
                     title:1,
                     description:1,
                     duration:1,
                     views:1
                  }
               }
            ]
         }
      },      
      {
         $project:{
            Details:{$arrayElemAt:["$videoDetails",0]}
            // videoInfo:1
         }
      }
   
   ])
  

   if(!likedVideo||likedVideo.length===0){
      throw new apiError(404,"LikeVideo not found !")
   }
   
   res.status(200)
      .json(new apiResponse(200,likedVideo,"likeVideo fetched successfully"))
})


export {toggleVideoLike,toggleCommentLike,toggleTweetLike,getLikedVideos}