import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //upload the file on cloudinary and what types of resource we uploading to cloudinary (resource_type: "auto")
    const response = await cloudinary.uploader.upload(localFilePath, {resource_type: "auto",});

    // //if file uploaded successfully
    // console.log("file is uploaded on cloudinary",response.url);
    // console.log("file is uploaded on cloudinary",response); 

    fs.unlinkSync(localFilePath); //after upload on cloudinary remove files from server 

    return response;
  } 
  catch (error) {
    fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload operation got failed
    return null;
  }
}

export {uploadOnCloudinary}
