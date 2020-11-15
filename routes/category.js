
import Services from '../controller/category'
const express = require('express')
const router = express.Router()

router.get('/', Services.get)

router.post('/', Services.create)

router.put('/', Services.update)
router.put('/view', Services.updateViewList)
router.delete('/', Services.delete)

module.exports = router
