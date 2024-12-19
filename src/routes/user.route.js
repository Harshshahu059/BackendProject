import {userController} from "../controllers/user.controller.js"
import { Router } from "express"

const router=Router()

router.route('/register').get(userController)

export default router