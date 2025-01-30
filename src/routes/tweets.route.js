 import {createTweet,getUserTweets,updateTweets,deleteTweet} from "../controllers/tweets.controller.js"
 import {Router} from "express"
 import { verifyJWT } from "../middleware/auth.middleware.js"

 const router=Router()

 router.use(verifyJWT)

 router.route("/").post(createTweet)

 router.route("/:tweetId").patch(updateTweets).delete(deleteTweet)

 router.route("/user/:userId").get(getUserTweets)

 export default router
