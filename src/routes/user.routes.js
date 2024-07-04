import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {verifyJWT} from '../middlewares/auth.middleware.js'
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
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(regenaratingAccessToken)

router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchhistory)



export default router;
