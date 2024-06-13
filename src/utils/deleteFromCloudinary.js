import { v2 as cloudinary } from "cloudinary";

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
//   });

// import { json } from "express";
import { ApiResponse } from "./ApiResponse.js";

const deleteImageCloudinary = async (publicId)=>{
    cloudinary.uploader.destroy(publicId,{resource_type:auto})

    // return json(new ApiResponse)
    return json(new ApiResponse(200,{},"Old image of User has been deleted from cloudinary"))

}
export {deleteImageCloudinary}