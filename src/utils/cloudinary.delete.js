import { v2 as cloudinary } from "cloudinary";

cloudinary.config({ 
    cloud_name: process.env.CLOUDNIARY_NAME, 
    api_key: process.env.CLOUDNIARY_API_KEY, 
    api_secret:process.env.CLOUDNIARY_SECRET // Click 'View API Keys' above to copy your API secret
})


const deleteFormCloudinary=async(publicId,resourceType)=>{

try {
    if(!publicId){return null}
    if(!resourceType){
    throw new Error("provide the resource type");
     
    }
    // don't used  cloudinary.v2.uploader.destroy we have already import v2 as cloudinary 
    const response=await cloudinary.uploader.destroy(publicId,{resource_type:resourceType})
    return response
} catch (error) {
     console.log(error,"Error in deleting the cloudinary file")    
        
}


}


export {deleteFormCloudinary}