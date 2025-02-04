import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import {subscriptionModle} from "../models/subscription.models.js"
import {usermodel} from "../models/user.models.js";
import mongoose from "mongoose";


const toggleSubscription=asyncHandler(async(req,res)=>{
    const {channelId} = req.params
    const subscriber=req.user._id
    // TODO: toggle subscription
    if(!channelId){
        throw new apiError(400,"channelId is required to toggleSubscription!")
    }
    const isChannel=await usermodel.findById(channelId)
    if(!isChannel){
        throw new apiError(404,"Channel not found!")
    }
    const isSubscribed=await subscriptionModle.findOne({
            subscriber:subscriber,
            channel:isChannel._id
    })
    if(isSubscribed){
        const result=await subscriptionModle.findByIdAndDelete(isSubscribed._id)
        res.status(200)
        .json(new apiResponse(200,result,"Unsubscribed successfully!"))
                
    }else{
        const result=await subscriptionModle.create(
            {
                subscriber:subscriber,
                channel:isChannel._id
            }
        )
        res.status(200)
           .json(new apiResponse(200,result,"Subscription add is successfully!"))
    }
    
})


// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!channelId){
        throw new apiError(400,"channelId is required to getUserChannelSubscriber!")
    }
    const result=await subscriptionModle.aggregate(
        [
            {
                $match:{
                    channel:new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $lookup:{
                    from:"users",//remember always first letter small(lowercase)+add s in last
                    localField:"subscriber",
                    foreignField:"_id",
                    as:"subscriberDetails",
                    pipeline:[
                    {
                    $project:{
                        _id:1,
                        fullname:1,
                        username:1,
                        avatar:1, 
                        }
                     }
                    ]
                }
            },
            {
                $project:{
                    subscriber:{$arrayElemAt:["$subscriberDetails",0]}
                }
            }
        ]
    )

    if(!result||result.length===0){
        throw new apiError(404,"subscriber not found")
    }
    res.status(200)
    .json(new apiResponse(200,result,"Subscriber list is feched successfully"))
})


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!subscriberId){
        throw new apiError(400,"subscribedId is required to getSubscribedChannels")
    }

    const result=await subscriptionModle.aggregate(
        [
            {
                $match:{
                    subscriber:new mongoose.Types.ObjectId(subscriberId)
                }
            },
            {
                $lookup:{
                    from:"users",
                    localField:"channel",
                    foreignField:"_id",
                    as:"ownerDetails",
                    pipeline:[
                        {
                            $project:{
                                _id:1,
                                fullname:1,
                                username:1,
                                avatar:1
                            }
                        }
                    ]
               }
            },
            {
                $project:{
                    subscriber:1,
                    channelDeatils:{$arrayElemAt:["$ownerDetails",0]}
                }
            }
        ]
    )

    if(!result||result.length===0){
        throw new apiError(404,"Channels not found, No subscription!")
    }
    res.status(200)
    .json(new apiResponse(200,result,"Channel feacted successfully!"))

})
export{toggleSubscription,getUserChannelSubscribers,getSubscribedChannels}

