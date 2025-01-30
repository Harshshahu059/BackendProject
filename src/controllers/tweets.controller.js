import  mongoose from "mongoose"
import tweet from "../models/tweets.model.js";
import { usermodel } from "../models/user.models.js" ;
import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"

const createTweet=asyncHandler(async(req,res)=>{
    const {content}=req.body
    const userId=req.user._id
    if(!content){
        throw new apiError(400,"Content should not be empty,it's required");        
    }
    const result=await tweet.create({
        owner:userId,
        content
    })
    if(!result||result.lenght===0){
        throw new apiError(500,"Server error when create tweet!")
    }
    res.status(200)
    .json(new apiResponse(200,result,"Tweet created successfully"))
        

})
const getUserTweets=asyncHandler(async(req,res)=>{
    const {userId}=req.params
    if(!userId){
        throw new apiError(400,"userId is required to find Tweets")
    }

    const result =await tweet.aggregate(
        [
            {
                $match:{
                    owner:new mongoose.Types.ObjectId(userId)
                }
            },
            {
              $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"ownerDetails", 
                pipeline:[
                    {
                        $project:{
                            _id:1,
                            username:1,
                            fullname:1,
                            avatar:1
                        }
                    }
                ]
              }
            },
            {
                $project:{
                    _Id:1,
                    content:1,
                    owner:{$arrayElemAt:["$ownerDetails",0]}
                }
            }
        ]
    )
    if(!result||result.length===0){
        throw new apiError(404,"tweets not found!")
    }
    res.status(200)
    .json(new apiResponse(200,result,"User tweets feacted successfully!"))


})

const updateTweets=asyncHandler(async(req,res)=>{
    const {content}=req.body
    const {tweetId}=req.params
    const userId=req.user._id
     
    if(!content){
        throw new apiError(400,"content can't empty");
    }  
    const userTweet=await tweet.findById(tweetId)
    
    if(!userTweet){
        throw new apiError(404,"Tweet not found !")
    }
    
    if(!userTweet.owner.equals(userId)){
        throw new apiError(401,"Only owner can update tweet!")
    }

    userTweet.content=content
    const result=await userTweet.save()


if(!result||result.lenght===0){
    throw new apiError(500,"server error when update tweer, try again update!")
}
res.status(200)
.json(new apiResponse(200,result,"tweet update successfully"))
 
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
   const {tweetId}=req.params
   const userId =req.user._id

   if(!tweetId){
    throw new apiError(400,"tweetId is required to delete tweet")
   }
   const result=await tweet.findOneAndDelete(
    {
        _id:tweetId,
        owner:userId
    }
   )
   if(!result||result.lenght===0){
    throw new apiError(401,"Only owner can delete tweet or tweet not found!")
   }

   res.status(200)
   .json(new apiResponse(200,result,"tweet delete successfully"))

})
export{createTweet,getUserTweets,updateTweets,deleteTweet}