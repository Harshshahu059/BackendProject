import {asyncHandler} from "../utils/asyncHandler.js"

let userController=asyncHandler(async(req,res)=>{
    res.status(200).json({
        message:"ok"
    })
})

    

export {userController}