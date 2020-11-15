
import Services from '../controller/tour'
const express = require('express')
const router = express.Router()

router.get('/', Services.get)
router.get('/all', Services.getAll)
router.get('/paypalResponse', Services.getResponse)
router.get('/me/:id', Services.getById)

router.post('/', Services.create)
router.post('/search', Services.search)
router.post('/payment', Services.tourPayment)
router.post('/', Services.create)

router.put('/', Services.update)
router.delete('/', Services.delete)

module.exports = router
