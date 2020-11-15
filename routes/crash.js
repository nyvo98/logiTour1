
import Services from '../controller/crash'
const express = require('express')
const router = express.Router()

router.get('/', Services.get)
router.post('/', Services.create)

module.exports = router
