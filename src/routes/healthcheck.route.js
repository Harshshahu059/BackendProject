import {healthCheck} from "../controllers/healthcheck.controller.js"
import {Router} from "express"

const router=Router()

router.route("/").get(healthCheck)


export default router