import mongoose, { Schema } from "mongoose";

const playlistSchema= new Schema({
   name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 100
  },
  description: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      minlength: 10,
      maxlength: 500
  },
     videos:[{
      type:Schema.Types.ObjectId,
      ref:"Video"
     },
     ],
     owner:{
      type:Schema.Types.ObjectId,
      ref:"User",
      required:true
     }
},{timestamps:true})

const userPlaylist=mongoose.model("Playlist",playlistSchema)

export default userPlaylist;