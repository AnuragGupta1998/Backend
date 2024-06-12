import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {verfyJWT} from '../middlewares/auth.middleware.js'
import { 
    changeCurrentPassword, 
    getCurrentUser, 
    getUserChannelProfile, 
    getWatchhistory, 
    loginUser, 
    logoutUser, 
    regenaratingAccessToken, 
    registerUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage, } from "../controllers/user.controller.js";


const router = Router();
 
router.route("/register").post(
    upload.fields([          //uploading avatar and coverImage by multer
        {
            name:"avatar",
            maxCount:1,
        },
        {
            name:"coverImage",
            maxCount:1,
        }
    ]) , registerUser
);                            //http://localhost:8000/api/v1/users/register

router.route("/login").post(loginUser);

//secure routes
router.route("/logout").post(verfyJWT,logoutUser)
router.route("/refresh-token").post(regenaratingAccessToken)

router.route("/change-password").post(verfyJWT, changeCurrentPassword)
router.route("/current-user").get(verfyJWT, getCurrentUser)
router.route("/update-account").patch(verfyJWT, updateAccountDetails)
router.route("/avatar").patch(verfyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verfyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/c/:username").get(verfyJWT, getUserChannelProfile)
router.route("/history").get(verfyJWT, getWatchhistory)



export default router;
