import mongoose ,{Schema, trusted} from "mongoose";
const videoSchema=new Schema({
    videoFile:{
        type:String ,//couldinary url
        required:true
    },
   thumbnail:{
        type:String ,//couldinary url
        required:true
    },
   title:{
        type:String ,
        required:true
    },
    description:{
        type:String ,
        required:true
    },
    duration:{
        type:Number ,//couldinary 
        required:true
       },
       views:{
        type:Number,
        default:0
       },
       isPublised:{
        type:Boolean,
        default:true
       },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }

},{timestamps:true})

export const videoModel=mongoose.model('Video',videoSchema)