
import ConfigServices from '../controller/config'
const express = require('express')
const router = express.Router()

router.get('/', ConfigServices.get)
router.get('/type/:type', ConfigServices.getByType)

router.post('/typeMulti', ConfigServices.getByTypeMultiple)
router.post('/', ConfigServices.create)
router.put('/', ConfigServices.update)

module.exports = router
