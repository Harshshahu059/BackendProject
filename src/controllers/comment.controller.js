import mongoose from "mongoose"
import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import UserComment from "../models/comments.modle.js"
import{videoModel} from"../models/video.models.js"
import { pipeline } from "stream"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 2} = req.query
    if(!page||!limit){
        throw new apiError(400,"page and limit should not empty")
    }
     
    if(!videoId){
        throw new apiError(400,"videoId is required to find comment!")
    }
    
    const result=await UserComment.aggregate(
        [
            {
                $match:{
                    video:new mongoose.Types.ObjectId(videoId)
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
                   pipeline:[
                    {
                        $project:{
                            username:1,
                            fullname:1,
                            _id:1,
                            avatar:1
                        }
                    }
                   ]
                 }
                
            },
            {
                $addFields:{
                    ownerDetails:{
                        $first:"$owner"
                    }
                }
            },
            {
                $project:{
                    _id:1,
                    content:1,
                    videoId:1,
                    ownerDetails:1
                }
            }

        ]
    )

    if(!result||result.length===0){
        throw new apiError(404,"videoId is incorrect or video have Zero comments!")
    }
    
    res.status(200)
       .json(new apiResponse(200,result,"Comment of this video feacted successfully"))


})


const addComment=asyncHandler(async(req,res)=>{
    const{content}=req.body
    const{videoId}=req.params
    const userId=req.user._id

    if(!content){
        throw new apiError(400,"content shound not empty !")
    }
    if (!videoId){
        throw new apiError(400,"videoID is reuired to addcomment")
    }
    const isVideo=await videoModel.findById(videoId)
    if(!isVideo){
        throw new apiError(400,"video not found")
    }

    const result=await UserComment.create(
        {
            content,
            video:videoId,
            owner:userId
        }
    )

    if(!result){
        throw new apiError(500,"server error when addComment!")
     }

     res.status(200)
     .json(new apiResponse(200,result,"Addcomment successfully"))
})
const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const{content}=req.body
    const{commentId}=req.params
    const userId=req.user._id

   if(!commentId){
   throw new apiError(400,"commentId is required to update")
   }
   if(!content){
    throw new apiError(400,"content is required to updated")
   }
   
   const isComment =await UserComment.findById(commentId)
   if(!isComment){
    throw new apiError(404,"comment not found may be it deleted")
   }
   if(!userId.equals(isComment.owner)){
    throw new apiError(400,"only owner can update comment")
   }

   isComment.content=content
   const result =await isComment.save()

   res.status(200)
   .json(new apiResponse(200,result,"comment update Successfuly"))

   

})
const deleteComment=asyncHandler(async(req,res)=>{
    const{commentId}=req.params
    const userId=req.user._id
    
  console.log(commentId,userId)

    if(!commentId){
        throw new apiError(400,"commentId is required !")
    }

    const result = await UserComment.findOneAndDelete({
        _id: commentId,
        owner: userId,
    });
      
    if (!result) {
        throw new apiError(401, "You are not authorized to delete this comment or comment does not exist!");
    }

    res.status(200)
    .json(new apiResponse(200,result,"comment delete successfully"))

})



export{addComment,updateComment,deleteComment,getVideoComments}