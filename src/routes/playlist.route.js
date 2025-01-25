import {Router} from "express"
import {createPlaylist,
       getUserPlaylist,
       getPlaylistById,
       addVideoToPlaylist,
       removeVideoFromPlaylist,
       deletePlaylist,
       updatePlaylist
    } from "../controllers/playlist.controller.js"
import {verifyJWT} from "../middleware/auth.middleware.js"

const router=Router()
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(createPlaylist)

// : used because we get data form params
router.route("/:playlistId")
.get(getPlaylistById)
.delete(deletePlaylist)
.patch(updatePlaylist)
      

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);


      // In these playlist only specific playlist
router.route("/user/:userId").get(getUserPlaylist);


export default router