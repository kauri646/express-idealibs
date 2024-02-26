import { Router } from 'express'
import { getUsers, signUp, signIn, logOut } from '../controller/users/userController.js'
const router = Router()

router.get("/", getUsers)
router.post('/signup', signUp)
router.post('/signin', signIn)
//router.post('/verifyotp', verifyOtp)
router.post('/logout', logOut)

export default router