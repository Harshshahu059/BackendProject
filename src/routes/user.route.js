import {loginUser, registerUser,logoutUser} from "../controllers/user.controller.js"
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
router.route('/logout').post(
    //secured route
    verifyJWT,logoutUser)

export default router