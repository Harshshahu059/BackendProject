import mongoose from "mongoose";
import {asyncHandler} from "../utils/asyncHandler.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import playlist from "../models/playlist.model.js"


const createPlaylist =asyncHandler(async(req,res)=>{
     const {name,description}=req.body
     const owner=req.user._id
     console.log(owner)
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


export{createPlaylist}