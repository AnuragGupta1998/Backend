import { v2 as cloudinary } from "cloudinary";

// import { json } from "express";
import { ApiResponse } from "./ApiResponse";

const deleteImageFromCloudinary = async (oldImagePath)=>{
    cloudinary.uploader.destroy(oldImagePath,{resource_type:auto})

    // return json(new ApiResponse)
    return json(new ApiResponse(200,{},"Old image of User has been deleted from cloudinary"))

}
export {deleteImageFromCloudinary}