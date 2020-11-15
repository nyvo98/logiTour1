import OtherServices from '../controller/other'
const express = require('express')
const router = express.Router()

router.post('/upload', OtherServices.uploadImage)
router.post('/uploadFile', OtherServices.uploadFile)
router.get('/getImage/:linkImage', OtherServices.getImage)
router.get('/getFileLang/:lang', OtherServices.getFileLang)
router.put('/updateFileLang', OtherServices.updateFileLang)

module.exports = router
