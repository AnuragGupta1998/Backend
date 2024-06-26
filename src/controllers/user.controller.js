import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// import { deleteImageCloudinary } from "../utils/deleteFromCloudinary.js";
import mongoose from "mongoose";


//generate accessToken and refreshToken ........................................................................
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

//signup .............................................................................................
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

  //user details taking from form
  const { username, email, password, fullName } = req.body;

  // validation - not empty it check all field should not to be empty 
  //if empty then return true if it true then send an error msg

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

  //create User in Database..........
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

//login ...................................................................................................
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
  // console.log("user is ",user)
  // console.log("user id is ",user._id)

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
    .cookie("accessToken", accessToken, options)    //set values in cookies accessToken and refreshToken
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

//logoutUser .................................................................................................
const logoutUser = asyncHandler(async (req,res) =>{

  //updating user
  await User.findByIdAndUpdate(
    req.user._id,   //user coming from auth middlewale check routes
    {
      $unset:{
        accessToken:1   // this removes the field from document
      }
      
      // set:{
      //   accessToken:undefined
      // 
    },
    {
      new:true      //it return with updated User
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

//regenarating AccessToken with the help of refresshToken from req.cookies ......................................
const regenaratingAccessToken = asyncHandler(async(req,res) =>{

  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken ;

  if(!incomingRefreshToken) throw new ApiError(401," incomingRefreshToken Invalid refresh token please re-login");

  //verify refreshToken by JWT
  try {
    const decodedRefreshToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedRefreshToken._id)

    if(!user) throw new ApiError(401," User Invalid Refresh Token");

    const {accessToken,refreshToken:newRefreshToken} = await generateAccessAndRefreshToken(user._id);

    console.log("newRefreshToken",newRefreshToken)
    // console.log("RefreshToken",refreshToken)

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
          refreshToken: newRefreshToken,
        },
        "Access token refreshed"       
      )
    );
  } catch (error) {
    throw new ApiError(401, error?.message || "Catch Invalid refresh token");   
  }

});

//change current Password ..............................................................................
const changeCurrentPassword = asyncHandler(async (req,res) =>{

  // const{oldPassword,newPassword,confirmPassword}=req.body;
  // if(newPassword !== confirmPassword) throw new ApiError(400,"new and confim Password not same");

  const{oldPassword,newPassword}=req.body;

  console.log("oldPassword",oldPassword)
  console.log("newPassword",newPassword)
  
  //find user by authmiddleware
  const user = await User.findById(req.user._id);

  //check old password with DB stored password of user
  const isOldPasswordIsCorrect = await user.isPasswordCorrect(oldPassword);

  if(!isOldPasswordIsCorrect) throw new ApiError(400,"invalid old password");

  //change old password with newPassword
  user.password = newPassword;
  user.save({validateBeforeSave:false});

  return res.status(200).json(new ApiResponse(200,user,"Password change Successfully"))

})

//getCurrent User by using authMiddleware .......................................................................................
const getCurrentUser=asyncHandler(async (req,res) =>{ 
  return res.status(200).json(new ApiResponse(200,req.user,"User fetched Successfully"));
})

//update User Account Detail Text based .......................................................................................
const updateAccountDetails = asyncHandler(async (req,res) =>{

  const{fullName,email}=req.body;

  if(!(fullName || email)) throw new ApiError(400,"All fields are required");

  //const user=await User.findById(req.user._id)
  // user.fullName=fullName;
  // user.email=email;
  // user.save({validateBeforeSave:false})

  const user = await User.findByIdAndUpdate(
    req.user?._id,      //find the user by auth-middleware
    {
      $set:{          //it set the fullName and email
        fullName,     //fullName:fullName
        email         //email:email
      }
    },
    {
      new:true          //it return new updated user informtion
    }
  ).select("-password -refreshToken");

  // console.log("updateAccountDetails",user) // work successfully

  return res 
  .status(200)
  .json(new ApiResponse(200,user,"Successfully Update Account Details"))

})

//update User Avatar image based files.....................................................................................
const updateUserAvatar=asyncHandler(async (req,res) =>{

  //get avatar file through multer middleware
  const avatarLocalPath = req.file?.path;
  if(!avatarLocalPath) throw new ApiError(400,"avatar file is missing");

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  //Todo Assignment delete old image of user image from cloudinary 
  //delete old image from cloudinary after new image uploaded on cloudinary
  // const oldUser = await User.findById(user._id)
  // const oldImagePath=oldUser.avatar;
  // deleteImageCloudinary(oldImagePath.url)


  if(!avatar.url) throw new ApiError(400,"Error while uploading on avatar");

  const user = await User.findByIdAndUpdate(
    req.user._id,         //from auhtMiddleware
    {
      $set:{
        avatar:avatar.url          //update avatar of user with new avatar in DB
      }
    },
    {
      new:true         //it send updated user
    }
  ).select("-password");   //it does not send password field to frontend

  return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
});

//update user cover image ..................................................................................................
const updateUserCoverImage=asyncHandler(async (req,res) =>{

  //get coverImage file through multer middleware
  const coverImageLocalPath=req.file?.path;
  console.log(req.file)
  if(!coverImageLocalPath) throw new ApiError(400,"coverImage file is missing");

  const coverImage=await uploadOnCloudinary(coverImageLocalPath)

  if(!coverImage.url) throw new ApiError(400,"Error while uploading on avatar");

  const user = await User.findByIdAndUpdate(
    req.user._id,         //from auhtMiddleware
    {
      $set:{
        coverImage:coverImage.url     //update coverimage of user with new coverImage in DB
      }
    },
    {
      new:true  //return updated user
    }
  ).select("-password");

  return res
    .status(200)
    .json(
        new ApiResponse(200, user, "coverImage image updated successfully")
    )
});

//MongoDb aggregation pipeline............................................................................................
const getUserChannelProfile=asyncHandler(async (req,res)=>{

  //get data from url by params
  const{username} = req.params

  if(!username?.trim()) throw new ApiError(400,"username is missing ");

  //find user by aggregation pipeline
  const channel = await User.aggregate([

    { //(match operator is used to find user) by username in User DB collection
      $match:{
        username: username?.toLowerCase()  
      }
    },

    { //lookup opretor is used to left join the document (model)
      //subscribers of channel
      $lookup:{
        from:"subscriptions",          // join subscription model with user model
        localField:"_id",              // inside User
        foreignField:"channel",        // inside Subscription
        as:"subscribers"               // subscriber of channel(user)
      }
    },

    { //lookup opretor is used to left join the document (model)
      //to whom channel subscribed
      $lookup:{
        from:"subscriptions",          // join subscription model with user model
        localField:"_id",              // inside User
        foreignField:"subscriber",     // inside Subscription
        as:"subscribedTo"            // to whom user subscribed 
      }
      
    },

    { //addField operator used to add field in User model
      $addFields:{
        subscribersCount:{       //name of field
          $size:"$subscribers"    //size operator calculate the subscribers of channel
        },

        channelSubscribedToCount:{  //name of field
          $size:"$subscribedTo"    //size operator calculate the channel subscribed To(to whom channel subscribed)
        },

        isSubscribed:{
          $cond:{     //condition operator to validation check
            if:{      //in oprerator is used to check user present in or not
              $in:[req.user?._id,"$subscribers.subscriber"]  //it check user present ot not inside subscribers document
            },
            then:true,
            else:false
          }

        }
      }
    },

    { //project stage aggregation to projection of requested field to next stage
      //and project should be last stage of aggeragation pipeline
      $project:{
        fullName:1,
        username:1,
        email:1,
        subscribersCount:1,
        channelSubscribedToCount:1,
        isSubscribed:1,
        avatar:1,
        coverImage:1,



      }
    }
  ])

  if(!channel?.length) throw new ApiError(400,"channel does not exist");

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      channel[0],
      "User Channel Fetched Successfully"
    )
  )

})

//aggregation pipeline to getWatchHistory................................................................................
const getWatchhistory = asyncHandler(async (req,res) => {

  const user = await User.aggregate([

    {
      $match:{
        _id:new mongoose.Types.ObjectId(req.user._id)
      }
    },

    {
      $lookup:{
        from:"videos",
        localField:"watchHistory",
        foreignField:"_id",
        as:"watchHistory",
        pipeline:[
          {
            $lookup:{
              from:"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[
                {
                  $project:{
                    fullName:1,
                    username:1,
                    avatar:1
                  }
                }
              ]
            }
          },
          {
            $addFields:{
              owner: {
                $first:"$owner"
              }
            }
          }
        ]
      }
    }
  ])

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      user[0].watchHistory,
      "fetched watchHistory successfully"
    )
  )
})



export { 
  registerUser, 
  loginUser,
  logoutUser,
  regenaratingAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchhistory
};
