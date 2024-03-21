import { Router } from 'express'
import { createIcon, createPost, getAllFiles, getFileById, getAllIcons } from '../controller/files/fileController.js'
const router = Router()

//router.get("/", getUsers)
router.post('/upload-image/:id', createPost)
router.post('/upload-icon/:id', createIcon)
router.get('/icons/', getAllIcons)
router.get('/', getAllFiles)
router.get('/:id', getFileById)
// router.post('/collections', addToCollection)
// router.get('/collections/:id', getUserCollections)
//router.post('/signin', signIn)
//router.post('/verifyotp', verifyOtp)
//router.post('/logout', logOut)

export default router