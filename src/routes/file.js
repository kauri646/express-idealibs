import { Router } from 'express'
import { createPost, getAllFiles } from '../controller/files/fileController.js'
const router = Router()

//router.get("/", getUsers)
router.post('/upload-image', createPost)
router.get('/', getAllFiles)
//router.post('/signin', signIn)
//router.post('/verifyotp', verifyOtp)
//router.post('/logout', logOut)

export default router