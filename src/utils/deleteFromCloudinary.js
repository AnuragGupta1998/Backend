import { v2 as cloudinary } from "cloudinary";

// import { json } from "express";
import { ApiResponse } from "./ApiResponse";

const deleteImageCloudinary = async (publicId)=>{
    cloudinary.uploader.destroy(publicId,{resource_type:auto})

    // return json(new ApiResponse)
    return json(new ApiResponse(200,{},"Old image of User has been deleted from cloudinary"))

}
export {deleteImageCloudinary}