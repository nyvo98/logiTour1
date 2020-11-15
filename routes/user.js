
import UserServices from '../controller/user'
const express = require('express')
const router = express.Router()

router.get('/', UserServices.get)
router.get('/me:id', UserServices.getById)
router.get('/count', UserServices.count)

router.post('/reg/confirm', UserServices.confirmUserRegister)
router.post('/reg/admin', UserServices.postLoginAdmin)
router.post('/reg/pw', UserServices.postLoginPassword)
router.post('/reg/fb', UserServices.postLoginFacebook)
router.post('/reg/gg', UserServices.postLoginGoogle)
router.post('/pwReset', UserServices.resetPassword)

router.put('/pwChange', UserServices.changePassword)
router.put('/', UserServices.update)
router.delete('/', UserServices.delete)

module.exports = router
