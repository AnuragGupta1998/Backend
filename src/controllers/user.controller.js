import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


//generate accessToken and refreshToken...
const generateAccessAndRefreshToken = async(userId) => {
  
  try {
    const user = await User.findById(userId);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken; //add value into user object's refreshToken field

    await user.save({validateBeforeSave: false }) //save refreshToken into DB without validation

    return {accessToken,refreshToken }

  } catch (error) {
    console.log(error)
    throw new ApiError(500,"something went wrong while generating access and refresh token")
  }
}

//signup...........
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
  // console.log("req.files=", req.files);
  const { username, email, password, fullName } = req.body;

  // validation - not empty it check all field should not to be empty if empty then return true if it true then send an error msg
  if ([username, email, password, fullName].some((field) => field?.trim() === "")){
    throw new ApiError(400, "All fields must be required to proceed");
  }
  // if(!email.contain("@")){
  //   throw new ApiError(400,"please enter email with @")
  // }

  //check user is existed or not...
  const existedUser = await User.findOne(
    {
     $or: [{ username }, { email }],
    }
  );

  if (existedUser) throw new ApiError(400, "User with email or username already exists  ");

  //multer provide us access to files ( upload middleware we can access file)
  const avatarLocalPath = req.files?.avatar[0]?.path;

  // const coverImageLocalPath=req.files?.coverImage[0]?.path;
  let coverImageLocalPath;

  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // check for avatartLocalPath
  if (!avatarLocalPath) throw new ApiError(400, "avatar must required");

  //upload avatar and coverImage on cloudinary 
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  //if avatar is not uploaded on cloudinary
  if (!avatar) throw new ApiError(400, "avatar must required"); //check avatar uploaded on cloudinary or not

  //create User in Database
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    password,
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  //do not send password and refreshToken to user
  const userCreated = await User.findById(user._id).select("-password -refreshToken");

  if (!userCreated) throw new ApiError(500, "someting went wrong server error while registring user");

  return res
    .status(201)
    .json(new ApiResponse(200, userCreated, "User registered Successefully"));
});

//login............
const loginUser = asyncHandler(async (req, res) => {
  // Todo list
  // required data from req.body
  // check username/email is send by user or not
  // find the user in DB
  // check password
  // geneerte access and refresh token
  //send (above token) in cookies

  //collect data
  const { email, username, password } = req.body;
  
  // check username/email is send by user or not
  if (!username && !email) throw new ApiError(400, "username or email is required");

  //find user in DB after receive the data(username.email,password)
  const user = await User.findOne(
    {
     $or: [{ username }, { email }] //finding user on the bases of username or email using or operator
    }
  )
  console.log("user is ",user)
  console.log("user id is ",user._id)

  //if user does not exist..
  if (!user) throw new ApiError(400, "user does not exists please register/signup");

  //check user password..
  const isPasswordRight = await user.isPasswordCorrect(password);

  if (!isPasswordRight) throw new ApiError(401, "please enter valid password");

  //generate access and refresh token...
  const { accessToken,refreshToken } = await generateAccessAndRefreshToken(user._id)

  const loggedInUser = await  User.findById(user._id).select("-password -refreshToken")

  //sending cookies......
  //designing option
  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          //what we sending from user
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In successfully"
      )
    );
});

//logoutUser.............................................
const logoutUser = asyncHandler(async (req,res) =>{

  //updating user
  await User.findByIdAndUpdate(
    req.user._id,   //it coming from middlewale check routes
    {
      $unset:{
        accessToken:1
      }
    },
    {
      new:true
    }
  )

  const options={
    httpOnly:true,
    secure:true
  }

  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json( new ApiResponse(200,{},"User logged out Successfully"))
  
});

//regenarating AccessToken with the help of refresshToken
const regenaratingAccessToken=asyncHandler(async(req,res)=>{

  const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken ;

  if(!incomingRefreshToken) throw new ApiError(401," incomingRefreshToken Invalid refresh token please re-login");

  //verify refreshToken by JWT
  try {
    const decodedRefreshToken= jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);

    const user=await User.findById(decodedRefreshToken._id)

    if(!user) throw new ApiError(401," User Invalid Refresh Token");

    const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user._id);

    const options={
      httpOnly:true,
      secure:true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,
          refreshToken:newRefreshToken 
        },
        "Access token refreshed"       
      )
    );
  } catch (error) {
    throw new ApiError(401, error?.message || "Catch Invalid refresh token");   
  }

});

export { 
  registerUser, 
  loginUser,
  logoutUser,
  regenaratingAccessToken
};
