import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // uplod files by multer in public/temp folder
  // check for images, check for avatar
  // upload them to cloudinary, avatar check is uploaded on cloudinary or not
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  //user details
  console.log("req.files=",req.files)
  const { username, email, password, fullName } = req.body;

  // validation - not empty it check all field should not to be empty if empty then return true
  if ([username, email, password, fullName].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields must be required to proceed");
  }
  // if(!email.contain("@")){
  //   throw new ApiError(400,"please enter email with @")
  // }

  //check user is existed or not...
  const existedUser = await User.findOne({
    $or:[{ username },{ email }]
  });

  if(existedUser) throw new ApiError(400,"User with email or username already exists  ");

  //multer provide us access to files ( upload middleware we can access file) 
  // console.log("req.files",req.files)
  const avatarLocalPath = req.files?.avatar[0]?.path;

  // const coverImageLocalPath=req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // check for avatartLocalPath
  if(!avatarLocalPath) throw new ApiError(400,"avatar must required");

  //upload avatar and coverImage on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath); 

  // console.log("avatar",avatar)
  // console.log("coverImage",coverImage)

  if(!avatar) throw new ApiError(400,"avatar must required"); //check avatar uploaded on cloudinary or not

  //create User in Database
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    password,
    fullName,
    avatar:avatar.url,
    coverImage: coverImage?.url || ""
  });

  //do not send password and refreshToken to user
  const userCreated = await User.findById(user._id).select("-password -refreshToken");

  if(!userCreated) throw new ApiError(500,"someting went wrong while registring user");


  return res.status(201).json(
    new ApiResponse(200,userCreated,"User registered Successefully")
  )
  
});

export { registerUser };
