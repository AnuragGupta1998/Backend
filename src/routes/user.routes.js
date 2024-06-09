import { Router } from "express";
import { loginUser, logoutUser, regenaratingAccessToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import {verfyJWT} from '../middlewares/auth.middleware.js'


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
router.route('/refresh-token').post(regenaratingAccessToken)






export default router;
