import Services from '../controller/bookHistory'
const express = require('express')
const router = express.Router()

router.get('/', Services.get)
router.get('/allTourByAdmin', Services.getAllByAdmin)
router.get('/tourPayment/:id', Services.getTourById)
router.get('/tourByAdmin/:id', Services.getFromAdmin)
router.delete('/', Services.delete)
module.exports = router
