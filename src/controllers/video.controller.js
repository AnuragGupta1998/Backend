import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    try {
        const videoFileLocalPath = req.files?.videoFile[0]?.path;
        const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    
        if(!videoFileLocalPath) throw new ApiError(400,"error while getting video path");
        if(!thumbnailLocalPath) throw new ApiError(400,"error while getting thumbnail path");

        const videoFile = await uploadOnCloudinary(videoFileLocalPath);
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        
        if(!videoFile) throw new ApiError(400,"videoFile did not uploded on cloudinary");
        if(!thumbnail) throw new ApiError(400,"thumbnail did not uploded on cloudinary");

        const video=await Video.create({

            title,

            description,

            videoFile:{
                url:videoFile.url,
                public_id:videoFile.public_id
            },

            thumbnail:{
                url:thumbnail.url,
                public_id:thumbnail.public_id
            },

            duration:videoFile.duration,

            owner:req.user?._id,

            isPublished:false
        });
       
        const videoCreated=await Video.findById(video._id);

        if(!videoCreated) throw new ApiError(500,"by database video upload failed please try again");

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                videoCreated,
                "video file created successfully in DB"
            )
        )

    } catch (error) {
        console.log("error in publishVideo method",error)
        
    }


})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
