import Services from '../controller/notification'
const express = require('express')
const router = express.Router()

router.get('/', Services.get)

module.exports = router
