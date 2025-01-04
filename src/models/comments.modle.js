import mongoose, { Schema } from "mongoose";

const commentsSchema=new Schema({
    content:{
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 100
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video",
        required: true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required: true
    }
},{timestamps:true})
const UserComment=mongoose.model("Comments",commentsSchema)

export default UserComment