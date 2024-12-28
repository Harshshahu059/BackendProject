import {loginUser, registerUser,logoutUser,refershAccessToken,changePassword,getCurrentUser} from "../controllers/user.controller.js"
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
router.route('/getcurrentuser').post(verifyJWT,getCurrentUser)

export default router