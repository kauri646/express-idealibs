import { Router } from 'express'
import { createIcon, createPost, getAllFiles, getFileById, getAllIcons, addToCollection, getCollectionById, createPalette, getAllPalettes, getPaletteById } from '../controller/files/fileController.js'
const router = Router()

//router.get("/", getUsers)
router.post('/upload-image/:id', createPost)
router.post('/upload-icon/:id', createIcon)
router.get('/icons/', getAllIcons)
router.get('/colors', getAllPalettes)
router.get('/', getAllFiles)
router.get('/:id', getFileById)
router.post('/collections', addToCollection)
router.post('/color/:id', createPalette)
router.get('/color/:id', getPaletteById)
router.get('/collections/:id', getCollectionById)


export default router