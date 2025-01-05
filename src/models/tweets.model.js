import mongoose,{Schema} from "mongoose";


const tweetsSchema= new Schema({
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    content:{
        type:String,
        require:true,
        trim:true,
        minlength: 3,
        maxlength: 100
    }
},{timestamps:true})

const tweet= mongoose.model("Tweet",tweetsSchema)

export default tweet