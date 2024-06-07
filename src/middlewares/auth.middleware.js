import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";


export const verfyJWT = asyncHandler(async (req,_,next) =>{
    try {
        //accessToken from cookie or header to logout User
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");

        if(!token) throw new ApiError(401,"Unauthorized request");

        //verifying token from jwt
        const decodedToken=jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user=User.findById(decodedToken?._id).select("-password -refreshToken");

        if(!user) throw new ApiError(401,"invalid access token");

        req.user=user;
        next();
    
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")    
    }
});