import {Router} from "express";
import{addComment,updateComment,deleteComment,getVideoComments}from "../controllers/comment.controller.js"
import {verifyJWT} from "../middleware/auth.middleware.js"

const router=Router()
router.use(verifyJWT)
router.route("/:videoId").post(addComment).get(getVideoComments)


// /c/ is used to unquie form  "/:videoId"
router.route("/c/:commentId").patch(updateComment).delete(deleteComment)

export default router