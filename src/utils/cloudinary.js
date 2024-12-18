import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
                    cloud_name: process.env.CLOUDNIARY_NAME, 
                    api_key: CLOUDNIARY_API_KEY, 
                    api_secret: CLOUDNIARY_SECRET // Click 'View API Keys' above to copy your API secret
                })

  const uplodeOnCloudinary=async (filepath) => {
   try {
    if(!filepath) return null
   const resource= await cloudinary.uploader.upload(
        filepath, { resource_type:"auto"}
    )
    console.log('file is upload in cloudinary',resource.url)
    return resource
   } catch (error) {
    fs.unlinkSync(filepath) // remove the locally save file when opertation failed!!
    return null
   }
    
  }              


 export {uplodeOnCloudinary}
  





