import { Router } from 'express'
import { createPost, getAllFiles, getFileById } from '../controller/files/fileController.js'
const router = Router()

//router.get("/", getUsers)
router.post('/upload-image/:id', createPost)
router.get('/', getAllFiles)
router.get('/:id', getFileById)
//router.post('/signin', signIn)
//router.post('/verifyotp', verifyOtp)
//router.post('/logout', logOut)

export default router