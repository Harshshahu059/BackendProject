import {loginUser,
     registerUser,
     logoutUser,
     refershAccessToken,
     changePassword,
     getCurrentUser,
     updateAccountDetails,
     updateUserAvatar,
     updateUserCoverimage,
     getUserChannelProfile,
     getWatchHistory
    } from "../controllers/user.controller.js"


import { Router } from "express"
import {upload}from "../middleware/multer.middleware.js"
import{verifyJWT} from "../middleware/auth.middleware.js"

const router=Router()

router.route('/register').post(
    upload.fields([
    {
         name:"avatar",
         maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }]
)
    ,
    registerUser)
router.route('/login').post(loginUser)
router.route('/logout').post(verifyJWT,logoutUser)
router.route('/refresh-accessToken').post(refershAccessToken)
router.route('/changepassword').post(verifyJWT,changePassword)
router.route('/getcurrentuser').get(verifyJWT,getCurrentUser)
router.route('/updateAccountDetails').patch(verifyJWT,updateAccountDetails)
router.route('/updateuseravatar').patch(verifyJWT,
    upload.single('avatar')// when we have to upload single file    
    ,updateUserAvatar)
router.route('/updateUserCoverimage').patch(verifyJWT,upload.single('coverImage'), updateUserCoverimage)


router.route("/c/:username").get(verifyJWT,getUserChannelProfile)

router.route("/watchhistory").get(verifyJWT,getWatchHistory)




export default router