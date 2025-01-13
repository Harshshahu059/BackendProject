import { Router } from "express";
import {publishVideo,
        getVideoById,
        deleteVideoById,
        updateVideoDetails,
        togglePublishStatus  
      } from "../controllers/video.controller.js"
import {upload}from "../middleware/multer.middleware.js"
import {verifyJWT} from "../middleware/auth.middleware.js";

const router=Router()
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route('/publishvideo').post(
  upload.fields([
    {
        name:"video",
        maxCount:1
    },
    {
        name:"thumbnail",
        maxCount:1
    }
  ]),
  publishVideo
)
router.route('/:videoId')
.get(getVideoById)
.delete(deleteVideoById)// : dont used in postman
.patch(upload.fields([{ name:'thumbnail', maxCount: 1 }]),updateVideoDetails);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

//upload.fields([{ name: 'thumbnail', maxCount: 1 }])
export default router