let asyncHandler=(fn)=>{
  (req,res,next)=>{
    return Promise.resolve(fn(req,res,next)).catch((err)=>{
        next(err);
    })

  }
}
export default asyncHandler



 

// let asyncHandler=()=>{()=>{}}
//  let asyncHandler=(fn)=>async(req,res,next)=>{
//     try {
//        await fn(req,res,next)
//     } catch (error) {
//         res.status(error.code||500).json({
//              success:false,
//              message:error.message
//          })
        
//     }
//  }