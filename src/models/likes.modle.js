import mongoose,{Schema} from "mongoose";


const likeSchema= new Schema({
    Comment:{
        type:Schema.Types.ObjectId,
        ref:"Comments"
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    likedBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    tweet:{
        type:Schema.Types.ObjectId,
        ref:"Tweets"
    }
},{timestamps:true})

const like= mongoose.model("Like",likeSchema)
export default like