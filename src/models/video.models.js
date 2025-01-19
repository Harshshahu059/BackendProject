import mongoose ,{Schema, trusted} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema=new Schema({
    videoFile:{
        type:String ,//couldinary url
        required:true
    },
    videoPublicId:{
        type:String,
        require:true
    },
   thumbnail:{
        type:String ,//couldinary url
        required:true
    },
    thumbnailPublicId:{
        type:String,
        require:true
    }
    ,
   title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String ,
        required:true,
        trim:true
    },
    duration:{
        type:Number ,//couldinary 
        required:true
       },
       views:{
        type:Number,
        default:0
       },
       isPublished:{
        type:Boolean,
        default:true
       },
     owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }

},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate)

export const videoModel=mongoose.model('Video',videoSchema)