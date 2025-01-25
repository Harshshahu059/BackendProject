import mongoose from "mongoose";
import {asyncHandler} from "../utils/asyncHandler.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import playlist from "../models/playlist.model.js"


const verfiyOwner=(ownerId,userId,msg)=>{
     if(!ownerId||!userId){
          throw new apiError(400,"Both ownerId and userId is required to verfiy owner !!")
     }
     const check =ownerId.equals(userId)
     if(!check){
          throw new apiError(400,msg)
     }

}

const createPlaylist=asyncHandler(async(req,res)=>{
     const {name,description}=req.body
     const owner=req.user._id
    
     if(!name||!description){
          throw new apiError(400,"Both playlistName and description are required!!")
     }

     const userPlaylist=await playlist.create(
          {
               name,
               description,
               owner:owner
           
          }
     )
     const checkIsplaylistcreate=await playlist.findById(userPlaylist._id)
     if(!checkIsplaylistcreate){
          throw new apiError(500,"something went wrong when create playlist!!")
     }
     res
     .status(200)
     .json( new apiResponse(200,checkIsplaylistcreate,"playlist created succesfully!!") )

})

const getUserPlaylist=asyncHandler(async(req,res)=>{
  const{userId}=req.params

  if(!userId){
     throw new apiError(400,"userId required to find user playlist")
  }
  const userPlaylist=await playlist.aggregate(
     [
          {
               $match:{
                    owner: new mongoose.Types.ObjectId(userId)
               }
               //todo: feacted video also using pipline
               
          },
          {
               $lookup:{
                    from:"videos",
                    localField:"videos",
                    foreignField:"_id",
                    as:"Allvideos"
               }
          }
     ]
  )
  if(!userPlaylist||userPlaylist.length===0){
     throw new apiError(404,"UserPlaylist not found in this userId!")
  }

  res
  .status(200)
  .json(new apiResponse(200,userPlaylist,"playlist fetched successfully!"))
})

const getPlaylistById=asyncHandler(async(req,res)=>{
     //used{}because data comes in object 
     const {playlistId}=req.params


     if(!playlistId){
          throw new apiError(400,"playlistId is required!!")
     }
     
     // const result=await playlist.findById(playlistId)
     const result=await playlist.aggregate(
          [
               {
                    $match:{
                         _id:new mongoose.Types.ObjectId(playlistId)
                    }
               },
               {
                    $lookup:{
                         from:"videos",
                         localField:"videos",
                         foreignField:"_id",
                         as:"videodetails"
                    }
               }
          ]
     )


     if(!result||result.length===0){
          throw new apiError(404,"playlist not found !!")
     }

     res.status(200)
        .json(new apiResponse(200,result,"playlist fected successfully"))

})

const addVideoToPlaylist=asyncHandler(async(req,res)=>{
     const{playlistId,videoId}=req.params
     if(!playlistId||!videoId){
          throw new apiError(400,"Both playlistId and videoId is required to create playlist!")
     }

     const isPlayList=await playlist.findById(playlistId)

     if(!isPlayList){
          throw new apiError(404,"Playlist not found may be playlistId is wrong!!")
     }

     verfiyOwner(isPlayList.owner,req.user._id,"Only owner can addVideo in there playlist!!")
      
     isPlayList.videos.push(videoId); // Push the video ID into the videos array
     await isPlayList.save(); // Save the updated document back to the database

     const result=await playlist.aggregate(
          [
            { 
               $match:{
                    _id:new mongoose.Types.ObjectId(isPlayList._id)
               }
            },
            {
             $lookup:{
               from:"videos",
               localField:"videos",
               foreignField:"_id",
               as:"video"
             }
            },
            {
               $project:{
                    _id:1,
                    name:1,
                    description:1,
                    videos: { $arrayElemAt: ["$video", 0] },//or used $first by addfield
                    owner:1,
                    
               }
            }

          ]
     )
     
     res.status(200)
        .json(new apiResponse(200,result,"video add successfully to playlist"))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
     const {playlistId, videoId} = req.params
     // TODO: remove video from playlist
     if(!playlistId||!videoId){
          throw new apiError(400,"Both playlistId and videoId is required for delete video form playlist")
     }
     
     // const result=await playlist.aggregate(
     //      [
     //           {
     //             $match: {
     //               _id:new mongoose.Types.ObjectId(playlistId)
     //             }
     //           },
     //           {
     //             $unwind:"$videos"
     //           },
     //           {
     //             $group: {
     //               _id: "$videos",                         
     //             }
     //           },
     //           {
     //             $match: {
     //                     _id:new mongoose.Types.ObjectId(videoId)
     //                   }
     //           }
     //           ,
     //           {
     //                $pull
     //           }    
               
     //         ]
     // )
     const isPlayList=await playlist.findById(playlistId)
     if(!isPlayList){
          throw new apiError(404,"playlist not found !")
     }

     verfiyOwner(req.user._id,isPlayList.owner,"Only owner and remove the video form playlist!")
     
    isPlayList.videos.pull(videoId)
    const result=await isPlayList.save()
    if(!result){
     throw new apiError(500,"server error when remove video for playlist")
    }

     res.status(200)
      .json(new apiResponse(200,result,`Video:${videoId} is removed form playlist ${playlistId}`))
 
 })

const deletePlaylist =asyncHandler(async(req,res)=>{
     const {playlistId}=req.params
     if(!playlistId){
          throw new apiError(400,"playlistId is required to delete playlist")
     }
     const isPlayList=await playlist.findById(playlistId)
     if(!isPlayList){
          throw new apiError(404,"Playlist is not found !")
     }

     verfiyOwner(req.user._id,isPlayList.owner,"Only owner can delete playlist")

     
     const result=await playlist.findByIdAndDelete(playlistId)
     if(!result){
          throw new apiError(500,"server error when delete playlist!")
     }

     res.status(200)
     .json(new apiResponse(200,result,"delete playlist successfully!"))
})

const updatePlaylist=asyncHandler(async(req,res)=>{
     const {playlistId}=req.params
     const{name,description}=req.body
     console.log(name,description,playlistId)

     if(!playlistId){
          throw new apiError(400,"playlistId is required to update playlist details")
     }

     if(!name||!description){
          throw new apiError(400,"Both name and desription is required to update")
     }

     const isPlayList=await playlist.findById(playlistId)
     if(!isPlayList){
          throw new apiError(404,"playlist not found, enter vaild playlistId")
     }

     verfiyOwner(req.user._id,isPlayList.owner,"Only owner can update details")

     isPlayList.name=name
     isPlayList.description=description
     const result= await isPlayList.save()

     if(!result){
          throw new apiError(500,"Server error when update video Details!")
     }

     res.status(200)
     .json(new apiResponse(200,result,"Playlist update successfully"))

})
 

export{createPlaylist,getUserPlaylist,getPlaylistById,addVideoToPlaylist,removeVideoFromPlaylist,deletePlaylist,updatePlaylist}